const express = require('express');
const cors = require('cors');
const db = require('./database/db');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SplitMate API 運作中！' });
});

// ==========================================
// 群組 API (Groups)
// ==========================================

// 1. 取得所有群組 (含總金額)
app.get('/api/groups', (req, res) => {
  const sql = `
    SELECT 
      g.*,
      COALESCE(SUM(e.amount), 0) AS total_amount
    FROM groups g
    LEFT JOIN expenses e ON e.group_id = g.id
    GROUP BY g.id
    ORDER BY g.created_at DESC
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 2. 新增群組
app.post('/api/groups', (req, res) => {
  const { name, emoji } = req.body;
  if (!name) return res.status(400).json({ error: '請提供群組名稱' });

  const sql = 'INSERT INTO groups (name, emoji) VALUES (?, ?)';
  db.run(sql, [name, emoji || '🏠'], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, name, emoji, message: '群組建立成功' });
  });
});

// 3. 取得單一群組詳細資訊
app.get('/api/groups/:id', (req, res) => {
  const sql = 'SELECT * FROM groups WHERE id = ?';
  db.get(sql, [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: '找不到該群組' });
    res.json(row);
  });
});

// ==========================================
// 成員 API (Members)
// ==========================================

// 4. 取得某群組的所有成員
app.get('/api/groups/:id/members', (req, res) => {
  const sql = 'SELECT * FROM members WHERE group_id = ? ORDER BY joined_at ASC';
  db.all(sql, [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 5. 加入群組（若已存在則忽略，不報錯）
app.post('/api/groups/:id/members', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: '請提供成員名稱' });

  // INSERT OR IGNORE：name 已在群組內就靜默略過
  const sql = 'INSERT OR IGNORE INTO members (group_id, name) VALUES (?, ?)';
  db.run(sql, [req.params.id, name], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: '成員已加入', inserted: this.changes > 0 });
  });
});

// ==========================================
// 帳目 API (Expenses)
// ==========================================

// 6. 取得某群組的所有帳目
app.get('/api/groups/:id/expenses', (req, res) => {
  const sql = 'SELECT * FROM expenses WHERE group_id = ? ORDER BY created_at DESC';
  db.all(sql, [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 7. 新增一筆帳目
app.post('/api/groups/:id/expenses', (req, res) => {
  console.log('💰 收到記帳請求:', req.body);
  const group_id = req.params.id;
  const { title, amount, paid_by, split_method } = req.body;

  if (!title || !amount || !paid_by) {
    return res.status(400).json({ error: '請提供完整帳目資訊' });
  }

  const sql = 'INSERT INTO expenses (group_id, title, amount, paid_by, split_method) VALUES (?, ?, ?, ?, ?)';
  db.run(sql, [group_id, title, amount, paid_by, split_method || '平分'], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, message: '記帳成功' });
  });
});

// ==========================================
// 結算 API (Settle) — 動態讀取成員
// ==========================================

// 8. 智慧結算演算法
//    可帶 query string ?me=小明 讓前端知道「我」的視角
app.get('/api/groups/:id/settle', (req, res) => {
  const groupId = req.params.id;

  // 先從 members 表取得該群組的成員名單
  db.all('SELECT name FROM members WHERE group_id = ?', [groupId], (err, memberRows) => {
    if (err) return res.status(500).json({ error: err.message });

    // 如果群組還沒有成員，回傳空結果
    if (memberRows.length === 0) {
      return res.json({ balances: [], transfers: [], memberCount: 0 });
    }

    const members = memberRows.map(r => r.name);

    // 取得群組內所有帳目
    db.all('SELECT * FROM expenses WHERE group_id = ?', [groupId], (err, expenses) => {
      if (err) return res.status(500).json({ error: err.message });

      // 1. 初始化每位成員的淨餘額為 0
      const balances = {};
      members.forEach(m => balances[m] = 0);

      // 2. 計算淨餘額
      //    付款人墊付全額 → 餘額 +amount
      //    每位成員平分應付 → 餘額 -amount/人數
      expenses.forEach(exp => {
        const memberCount = members.length;

        // 付款人加回全額
        if (balances[exp.paid_by] !== undefined) {
          balances[exp.paid_by] += exp.amount;
        }

        // 每人扣除應分擔的份額（只計算群組成員內的人）
        const splitAmount = exp.amount / memberCount;
        members.forEach(m => {
          balances[m] -= splitAmount;
        });
      });

      // 3. 區分債權人（餘額 > 0，別人欠他）與債務人（餘額 < 0，他欠別人）
      let debtors = [];
      let creditors = [];
      for (const [person, amount] of Object.entries(balances)) {
        if (amount < -0.01) debtors.push({ person, amount });
        else if (amount > 0.01) creditors.push({ person, amount });
      }

      // 債務人從最負排到最少，債權人從最多排到最少
      debtors.sort((a, b) => a.amount - b.amount);
      creditors.sort((a, b) => b.amount - a.amount);

      // 4. 貪婪配對：每次取最大債務人配最大債權人，最小化轉帳次數
      const transfers = [];
      let i = 0;
      let j = 0;

      while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];

        const debt = -debtor.amount;    // 轉為正數
        const credit = creditor.amount;
        const transferAmount = Math.min(debt, credit);

        transfers.push({
          from: debtor.person,
          to: creditor.person,
          amount: Math.round(transferAmount)
        });

        debtor.amount += transferAmount;
        creditor.amount -= transferAmount;

        if (Math.abs(debtor.amount) < 0.01) i++;
        if (Math.abs(creditor.amount) < 0.01) j++;
      }

      res.json({
        memberCount: members.length,
        balances: Object.entries(balances).map(([person, amount]) => ({
          person,
          amount: Math.round(amount)
        })),
        transfers
      });
    });
  });
});

// ==========================================
// 訂閱 API (Subscriptions)
// ==========================================

// 9. 取得所有訂閱
app.get('/api/subscriptions', (req, res) => {
  const sql = `
    SELECT s.*, g.name as group_name 
    FROM subscriptions s
    LEFT JOIN groups g ON s.group_id = g.id
    ORDER BY s.billing_day ASC
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 10. 新增訂閱 (加入 paid_by)
app.post('/api/subscriptions', (req, res) => {
  const { name, amount, billing_day, group_id, paid_by } = req.body;
  if (!name || !amount || !billing_day || !group_id || !paid_by) {
    return res.status(400).json({ error: '請填寫完整的訂閱資訊（包含付款人）' });
  }

  const sql = 'INSERT INTO subscriptions (group_id, name, amount, billing_day, paid_by) VALUES (?, ?, ?, ?, ?)';
  db.run(sql, [group_id, name, amount, billing_day, paid_by], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, message: '訂閱排程建立成功' });
  });
});

app.listen(PORT, () => {
  console.log(`🚀 後端伺服器已啟動於 http://localhost:${PORT}`);
});

// 11. 刪除群組與其所有關聯資料
app.delete('/api/groups/:id', (req, res) => {
  const groupId = req.params.id;
  // 使用 db.serialize 確保照順序刪除
  db.serialize(() => {
    db.run('DELETE FROM expenses WHERE group_id = ?', [groupId]);
    db.run('DELETE FROM members WHERE group_id = ?', [groupId]);
    db.run('DELETE FROM subscriptions WHERE group_id = ?', [groupId]);
    db.run('DELETE FROM groups WHERE id = ?', [groupId], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: '群組已成功刪除' });
    });
  });
});
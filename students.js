const fs = require('fs');
const csv = require('csv-parser');
const { MongoClient } = require('mongodb');

// MongoDB 連接設定
const uri = "mongodb://localhost:27017/";
const dbName = "411630097";
const collectionName = "studentslist";

// CSV 檔案路徑（請確認檔案名稱與位置正確，並刪除多餘的空格）
const filePath = 'studentslist.csv';

(async () => {
  const client = new MongoClient(uri);

  try {
    // 確認檔案是否存在
    if (!fs.existsSync(filePath)) {
      throw new Error(`CSV 檔案不存在：${filePath}`);
    }

    // 連接到 MongoDB
    await client.connect();
    console.log("成功連接到 MongoDB");

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // 讀取 CSV 檔案
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          // 插入資料到 MongoDB
          const insertResult = await collection.insertMany(results);
          console.log(`成功插入 ${insertResult.insertedCount} 筆資料！`);
        } catch (insertError) {
          console.error("插入資料時發生錯誤：", insertError);
        } finally {
          // 確保關閉連線
          await client.close();
        }
      });
  } catch (error) {
    console.error("發生錯誤：", error);
  }
})();

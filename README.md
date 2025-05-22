# Lab-06: gym_center-database (查詢優化)


## 1-1 列出「過去 6 個月未曾進場過的會員」的 member_id 與 name

### NOT IN
```sql
EXPLAIN
SELECT member_id, name
FROM Members
WHERE member_id NOT IN (
    SELECT DISTINCT member_id
    FROM Registrations
    WHERE entry_time >= DATE_SUB(CURRENT_DATE, INTERVAL 6 MONTH)
);
```

### NOT EXISTS
```sql
EXPLAIN
SELECT M.member_id, M.name
FROM Members M
WHERE NOT EXISTS (
    SELECT 1
    FROM Registrations R
    WHERE R.member_id = M.member_id
      AND R.entry_time >= DATE_SUB(CURRENT_DATE, INTERVAL 6 MONTH)
);
```

### LEFT JOIN IS NULL
```sql
EXPLAIN
SELECT M.member_id, M.name
FROM Members M
LEFT JOIN Registrations R
  ON R.member_id = M.member_id 
 AND R.entry_time >= DATE_SUB(CURRENT_DATE, INTERVAL 6 MONTH)
WHERE R.registration_id IS NULL;
```

---

## 1-2 列出同時報名過兩個指定時段的會員

```sql
SELECT member_id
FROM Registrations
WHERE course_schedule_id IN (
    '89c1b717-1b3a-11f0-a60a-0242ac110004',
    '89c1b57f-1b3a-11f0-a60a-0242ac110004'
)
GROUP BY member_id
HAVING COUNT(DISTINCT course_schedule_id) = 2;
```

---

##  2-1 找出「本月內沒有任何進場記錄」的會員

###  NOT EXISTS
```sql
EXPLAIN
SELECT M.member_id, M.name
FROM Members M
WHERE NOT EXISTS (
    SELECT 1 FROM Registrations R
    WHERE R.member_id = M.member_id
      AND R.entry_time >= DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')
);
```

###  NOT IN
```sql
EXPLAIN
SELECT member_id, name
FROM Members
WHERE member_id NOT IN (
    SELECT DISTINCT member_id
    FROM Registrations
    WHERE entry_time >= DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')
      AND member_id IS NOT NULL
);
```

### LEFT JOIN IS NULL
```sql
EXPLAIN
SELECT M.member_id, M.name
FROM Members M
LEFT JOIN Registrations R
  ON R.member_id = M.member_id
 AND R.entry_time >= DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')
WHERE R.registration_id IS NULL;
```

---

## 2-2 列出「至少曾參加自己擔任教練課程」的教練清單
```sql
SELECT S.staff_id, S.name
FROM StaffAccounts S
JOIN Members M ON S.staff_code = M.member_code
WHERE S.role = 'COACH'
  AND EXISTS (
      SELECT 1 FROM Registrations R
      JOIN CourseSchedules CS ON R.course_schedule_id = CS.course_schedule_id
      JOIN Courses C ON CS.course_id = C.course_id
      WHERE R.member_id = M.member_id
        AND C.coach_id = S.staff_id
  );
```

---

## 3-1 教練平均報名數

```sql
EXPLAIN
SELECT 
    S.name AS coach_name,
    C.name AS course_name,
    COUNT(DISTINCT CS.course_schedule_id) AS schedule_count,
    COUNT(R.registration_id) AS total_registrations,
    ROUND(COUNT(R.registration_id) / COUNT(DISTINCT CS.course_schedule_id), 2) AS avg_registration_per_schedule
FROM Courses C
JOIN StaffAccounts S ON C.coach_id = S.staff_id
JOIN CourseSchedules CS ON CS.course_id = C.course_id
LEFT JOIN Registrations R ON R.course_schedule_id = CS.course_schedule_id
GROUP BY S.staff_id, C.course_id, S.name, C.name
ORDER BY S.name, C.name;
```

---

## 3-2 找出三個月內報到次數最多的 10 名會員

```sql
EXPLAIN
SELECT
  M.member_id,
  M.name,
  COUNT(R.entry_time) AS attended_count
FROM Members M
JOIN Registrations R
  ON M.member_id = R.member_id
WHERE
  R.entry_time >= DATE_SUB(CURRENT_DATE, INTERVAL 3 MONTH)
  AND R.entry_time IS NOT NULL
GROUP BY M.member_id, M.name
ORDER BY attended_count DESC
LIMIT 10;
```

---

## 4-1 查出 entry_time 為 NULL 的報名紀錄，並顯示會員與課程名稱

```sql
SELECT
  M.member_id,
  M.name AS member_name,
  C.name AS course_name
FROM Registrations R
JOIN Members M
  ON R.member_id = M.member_id
JOIN CourseSchedules CS
  ON R.course_schedule_id = CS.course_schedule_id
JOIN Courses C
  ON CS.course_id = C.course_id
WHERE
  R.entry_time IS NULL;
```

---

##  4-2 檢查同一會員在同一時段報名多次的情況

```sql
SELECT
  R.member_id,
  M.name,
  R.course_schedule_id,
  COUNT(*) AS cnt
FROM Registrations R
JOIN Members M ON R.member_id = M.member_id
GROUP BY R.member_id, R.course_schedule_id, M.name
HAVING cnt > 1

UNION ALL

SELECT
  NULL AS member_id,
  '無重複資料' AS name,
  NULL AS course_schedule_id,
  NULL AS cnt
WHERE NOT EXISTS (
  SELECT 1
  FROM Registrations
  GROUP BY member_id, course_schedule_id
  HAVING COUNT(*) > 1
);
```

---

## 5-1 列出每位教練「本月」課程所有時段的平均出席人數

```sql
EXPLAIN
SELECT
  S.name AS coach_name,
  C.name AS course_name,
  COUNT(DISTINCT CS.course_schedule_id) AS schedule_count,
  COUNT(R.registration_id) AS total_attendance,
  ROUND(COUNT(R.registration_id) / NULLIF(COUNT(DISTINCT CS.course_schedule_id),0), 2) AS avg_attendance_per_schedule
FROM StaffAccounts S
JOIN Courses C ON C.coach_id = S.staff_id
JOIN CourseSchedules CS ON CS.course_id = C.course_id
LEFT JOIN Registrations R ON R.course_schedule_id = CS.course_schedule_id
                        AND R.entry_time IS NOT NULL
WHERE S.role = 'COACH'
  AND CS.start_time >= DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')
  AND CS.start_time <  DATE_ADD(DATE_FORMAT(CURRENT_DATE, '%Y-%m-01'), INTERVAL 1 MONTH)
GROUP BY S.staff_id, C.course_id, S.name, C.name
ORDER BY S.name, C.name;
```

---

## 5-2  列出一年內「從未缺席任何一場已報名時段」的學員名單（全勤會員）

###  NOT EXISTS 寫法
```sql
EXPLAIN
SELECT M.member_id, M.name
FROM Members M
WHERE NOT EXISTS (
    SELECT 1
    FROM Registrations R
    WHERE R.member_id = M.member_id
      AND R.register_time >= DATE_SUB(CURRENT_DATE, INTERVAL 1 YEAR)
      AND (R.entry_time IS NULL)
);
```

### NOT IN 寫法
```sql
EXPLAIN
SELECT member_id, name
FROM Members
WHERE member_id NOT IN (
  SELECT member_id FROM Registrations
  WHERE register_time >= DATE_SUB(CURRENT_DATE, INTERVAL 1 YEAR)
    AND entry_time IS NULL
    AND member_id IS NOT NULL
);
```

###  HAVING SUM 判斷
```sql
EXPLAIN
SELECT
  R.member_id,
  M.name
FROM Registrations R
JOIN Members M ON M.member_id = R.member_id
WHERE R.register_time >= DATE_SUB(CURRENT_DATE, INTERVAL 1 YEAR)
GROUP BY R.member_id, M.name
HAVING SUM(R.entry_time IS NULL) = 0;
```

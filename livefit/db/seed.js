/**
 * 任務 4：Seeder，種一些資料，證明你建立的資料表真的能使用。
 * 規則：可重複執行（先清空、再種入資料），即使執行多次也不會有資料疊加的狀況。
 * 執行順序：一定要先 npm run migration:run（沒有資料表，就無法種資料）
 */
const { dataSource } = require("./data-source");

/** 清空：被 FK 指著的表最後刪（先刪 COURSE，再 USER / SKILL）。
 *  不用 clear()（TRUNCATE 會被 FK 擋）、不用 delete({})（TypeORM 拒絕空條件）。 */
async function clearAll() {
  for (const name of ["Course", "User", "Skill"]) {
    if (dataSource.hasMetadata(name)) {
      await dataSource.createQueryBuilder().delete().from(name).execute();
    }
  }
}

async function main() {
  await dataSource.initialize();
  await clearAll();

  // ======================================================================
  // TODO：依照任務內容的規格寫入資料
  //   1. SKILL 三筆：重訓、瑜珈、飛輪
  //   2. USER 兩位教練，role 都為 'COACH'：
  //      海格教練（coach1@livefit.tw）、小美教練（coach2@livefit.tw）
  //   3. COURSE 四堂課：肌力入門班、週末飛輪、晨間瑜珈、核心特訓
  //      每堂課記得接上教練跟技能
  //      關聯的接法：user / skill 直接放前面存好的教練、技能物件
  //     （TypeORM 會自動取出它的 id 填進外鍵），寫法範例：
  //      courseRepo.save({ name: '...', user: 教練物件, skill: 技能物件 })
  // ======================================================================

  const skillRepo = dataSource.getRepository("Skill");

  const [weightTraining, yoga, spinning] = await skillRepo.save([
    {
      name: "重訓",
    },
    {
      name: "瑜珈",
    },
    {
      name: "飛輪",
    },
  ]);

  const userRepo = dataSource.getRepository("User");

  const [coach1, coach2] = await userRepo.save([
    {
      name: "海格教練",
      email: "coach1@livefit.tw",
      role: "COACH",
    },
    {
      name: "小美教練",
      email: "coach2@livefit.tw",
      role: "COACH",
    },
  ]);

  const courseRepo = dataSource.getRepository("Course");

  const newCourses = await courseRepo.save([
    {
      name: "肌力入門班",
      description: "從基礎動作開始，建立正確姿勢與肌力訓練觀念",
      startAt: new Date("2026-09-01T18:30:00+08:00"),
      endAt: new Date("2026-09-01T19:30:00+08:00"),
      maxParticipants: 16,
      user: coach1,
      skill: weightTraining,
    },
    {
      name: "週末飛輪",
      description: "搭配音樂節奏進行間歇騎乘，提升心肺耐力",
      startAt: new Date("2026-09-05T15:00:00+08:00"),
      endAt: new Date("2026-09-05T16:00:00+08:00"),
      maxParticipants: 12,
      user: coach2,
      skill: spinning,
    },
    {
      name: "晨間瑜珈",
      description: "透過柔和伸展與呼吸練習，舒展全身並喚醒活力",
      startAt: new Date("2026-09-09T07:30:00+08:00"),
      endAt: new Date("2026-09-09T08:30:00+08:00"),
      maxParticipants: 14,
      user: coach2,
      skill: yoga,
    },
    {
      name: "核心特訓",
      description: "運用多種核心訓練動作，強化穩定度與身體控制",
      startAt: new Date("2026-09-12T19:00:00+08:00"),
      endAt: new Date("2026-09-12T20:30:00+08:00"),
      maxParticipants: 10,
      user: coach1,
      skill: weightTraining,
    },
  ]);

  console.log("🌱 seed 完成");
  await dataSource.destroy();
}

main().catch((e) => {
  console.error("seed 失敗：", e.message);
  process.exit(1);
});

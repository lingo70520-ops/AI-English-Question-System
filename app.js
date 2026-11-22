/* =========================================================
   AI 英文智慧命題與教材檢核系統（示範版 v1.0）
   純前端本機運作：localStorage 儲存｜無付費 API 或後端
   ========================================================= */

(function () {
  "use strict";

  const STORAGE_KEY = "ai_english_question_system_v1";

  const CHECKLIST_ITEMS = [
    {
      key: "grammarSpelling",
      label: "1. 文法與拼字正確性",
      hint: "確認時態、主謂一致、介系詞、標點、拼字與英文語感自然度無誤。"
    },
    {
      key: "uniqueAnswer",
      label: "2. 答案是否唯一",
      hint: "確認正解具明確文本或語法依據，無第二個合理可解釋之選項。"
    },
    {
      key: "reasonableDistractors",
      label: "3. 干擾選項是否合理",
      hint: "確認四選項詞性與長度平行，干擾項具合理誘答力且無明顯送分漏洞。"
    },
    {
      key: "explanationMatch",
      label: "4. 答案與解析是否一致",
      hint: "確認繁體中文解析與正確答案吻合，並清楚說明其餘三個選項之錯因。"
    },
    {
      key: "gradeDifficulty",
      label: "5. 難度是否適合年級",
      hint: "確認字彙範圍（國中小 1,200 基礎字表）、句長與超綱詞中文加註符合目標年級。"
    },
    {
      key: "learningObjective",
      label: "6. 是否符合教材學習目標",
      hint: "確認本題確實評量標註之文法或閱讀理解能力指標，具素養與教學價值。"
    }
  ];

  const STATUS_LABELS = {
    pending: "待審核",
    needs_revision: "需修改",
    approved: "已核准"
  };

  const CHECK_STATE_LABELS = {
    unchecked: "尚未檢核",
    pass: "通過",
    issue: "有疑慮"
  };

  function createEmptyChecklist() {
    return {
      grammarSpelling: "unchecked",
      uniqueAnswer: "unchecked",
      reasonableDistractors: "unchecked",
      explanationMatch: "unchecked",
      gradeDifficulty: "unchecked",
      learningObjective: "unchecked"
    };
  }

  /**
   * 內建 9 題 100% 原創國中英文示範題目
   * 注意：
   * 1. 未複製任何 115 年會考 PDF 原題內容。
   * 2. 所有題目預設狀態皆為「待審核」，6 項品質檢核預設皆為「尚未檢核」，
   *    不會在未經檢查前自動標示為通過。
   */
  function getDefaultQuestions() {
    return [
      {
        id: "DEMO-01",
        grade: "國中一年級",
        type: "文法選擇題",
        topic: "校園日常與交通",
        difficulty: "基礎（CEFR A1+–A2）",
        objective: "能依據對話中的即時時間線索正確選用現在進行式",
        passageLabel: "",
        passage: "",
        glossary: "",
        stem: "Mia: Where is Kevin? Class is about to start.\nLeo: Look! He ______ his bicycle near the school gate.",
        options: {
          A: "parks",
          B: "parked",
          C: "is parking",
          D: "will park"
        },
        answer: "C",
        explanation:
          "對話中 Leo 先說「Look!（你看！）」，提示動作此刻正在發生，故應使用現在進行式 is parking。(A) parks 表示習慣動作，不符當下語境；(B) parked 為過去簡單式；(D) will park 表未來動作，皆不正確。",
        isCustom: false,
        checklist: createEmptyChecklist(),
        reviewStatus: "pending",
        reviewerName: "",
        reviewNotes: "",
        revisionSuggestions: "",
        updatedAt: "",
        history: []
      },
      {
        id: "DEMO-02",
        grade: "國中二年級",
        type: "文法選擇題",
        topic: "居家生活與突發事件",
        difficulty: "中等（CEFR A2+）",
        objective: "能在過去時間副詞子句語境中正確使用過去進行式",
        passageLabel: "",
        passage: "",
        glossary: "",
        stem: "When the lights suddenly went out last night, Emma ______ for her math test in her room.",
        options: {
          A: "studies",
          B: "was studying",
          C: "has studied",
          D: "will study"
        },
        answer: "B",
        explanation:
          "時間副詞子句 When the lights suddenly went out last night 描述昨晚某個過去瞬間發生的事件，主句表達當時「正在進行」的動作，應選過去進行式 was studying。(A) 為現在簡單式，與 last night 衝突；(C) 現在完成式不與明確過去時間連用；(D) 為未來式。",
        isCustom: false,
        checklist: createEmptyChecklist(),
        reviewStatus: "pending",
        reviewerName: "",
        reviewNotes: "",
        revisionSuggestions: "",
        updatedAt: "",
        history: []
      },
      {
        id: "DEMO-03",
        grade: "國中三年級",
        type: "文法選擇題",
        topic: "通勤習慣與時間管理",
        difficulty: "進階（CEFR A2+–B1-）",
        objective: "能辨識動名詞片語當單數主詞時與附加問句助動詞及代名詞的一致性",
        passageLabel: "",
        passage: "",
        glossary: "",
        stem: "Walking to school every morning doesn't take much time, ______?",
        options: {
          A: "does it",
          B: "doesn't it",
          C: "is it",
          D: "do they"
        },
        answer: "A",
        explanation:
          "動名詞片語 Walking to school every morning 作主詞時視為單數事件，代名詞應使用 it；直述句使用否定一般動詞助動詞 doesn't，依前否後肯原則，附加問句應為 does it。(B) 重複否定；(C) 誤用 be 動詞；(D) 誤用複數助動詞與代名詞。",
        isCustom: false,
        checklist: createEmptyChecklist(),
        reviewStatus: "pending",
        reviewerName: "",
        reviewNotes: "",
        revisionSuggestions: "",
        updatedAt: "",
        history: []
      },
      {
        id: "DEMO-04",
        grade: "國中一年級",
        type: "情境式閱讀題",
        topic: "校園園藝社週末活動海報",
        difficulty: "基礎（CEFR A1+–A2）",
        objective: "能讀懂校園活動海報之雨天備案、費用與攜帶物品規定並套用於情境判斷",
        passageLabel: "情境海報｜Sunshine Junior High — Green Hands Gardening Club",
        passage:
          "Do you love growing herbs and vegetables? Join our weekend workshop!\n" +
          "• Date: Every Saturday in May\n" +
          "• Time: 9:00 a.m. – 11:30 a.m.\n" +
          "• Place: School Rooftop Garden (Note: Moves to Room 204 on rainy days.)\n" +
          "• Fee: Free for students! (Tools and seeds are provided.)\n" +
          "• What to bring: A water bottle and a hat.\n" +
          "* Please do not wear sandals in the garden for your safety.",
        glossary: "herb 香草；provide 提供；sandal 涼鞋",
        stem: "Ben wants to join the Green Hands Gardening Club this Saturday morning, and the weather report says it will rain heavily. What should Ben do?",
        options: {
          A: "Go to the School Rooftop Garden at 9:00 a.m.",
          B: "Bring money to buy seeds and gardening tools.",
          C: "Wear sandals and go to Room 204.",
          D: "Go to Room 204 with a water bottle and a hat."
        },
        answer: "D",
        explanation:
          "海報註明下雨天活動改至 Room 204，且參加者需自備水壺與帽子（A water bottle and a hat），故 (D) 正確。(A) 忽略雨天改地點的 Note；(B) 學生免費且提供工具與種子；(C) 違反不可穿涼鞋（do not wear sandals）的安全規定。",
        isCustom: false,
        checklist: createEmptyChecklist(),
        reviewStatus: "pending",
        reviewerName: "",
        reviewNotes: "",
        revisionSuggestions: "",
        updatedAt: "",
        history: []
      },
      {
        id: "DEMO-05",
        grade: "國中二年級",
        type: "情境式閱讀題",
        topic: "社區圖書館借閱新規範",
        difficulty: "中等（CEFR A2+）",
        objective: "能精準辨識生活公告中的規則適用範圍、上限與例外條件",
        passageLabel: "情境公告｜Riverbank Community Library — New Borrowing Rules",
        passage:
          "1. Each card holder can borrow up to 6 books and 2 magazines at a time.\n" +
          "2. Books may be kept for 14 days; magazines may be kept for 7 days.\n" +
          "3. You can renew a book online once for 7 more days, unless another reader is waiting for it.\n" +
          "4. Eating is not allowed anywhere in the library. Closed water bottles are allowed on the 1st floor only.",
        glossary: "renew 續借",
        stem: "According to the rules, which of the following is NOT allowed at Riverbank Community Library?",
        options: {
          A: "Borrowing five books and one magazine on the same day.",
          B: "Keeping a borrowed magazine for six days.",
          C: "Drinking from a closed water bottle on the second floor.",
          D: "Renewing a book online when no one else is waiting for it."
        },
        answer: "C",
        explanation:
          "規則第 4 點明確規定「有蓋水壺僅限一樓使用（on the 1st floor only）」，故在二樓喝水違反規定，選 (C)。(A) 借 5 本書與 1 本雜誌未超出上限；(B) 雜誌借期為 7 天，借 6 天合規；(D) 無他人預約時可線上續借一次。",
        isCustom: false,
        checklist: createEmptyChecklist(),
        reviewStatus: "pending",
        reviewerName: "",
        reviewNotes: "",
        revisionSuggestions: "",
        updatedAt: "",
        history: []
      },
      {
        id: "DEMO-06",
        grade: "國中三年級",
        type: "情境式閱讀題",
        topic: "秋季環保市集分區導覽",
        difficulty: "進階（CEFR A2+–B1-）",
        objective: "能跨區域整合活動時間、付款方式與優惠條件，解決真實情境問題",
        passageLabel: "活動導覽卡｜Autumn Eco-Market Guide — Central Park Square",
        passage:
          "• Entrance (South Gate): Pick up a free cloth bag while supplies last.\n" +
          "• Zone A (West Side): Secondhand books and board games. Cash only.\n" +
          "• Zone B (North Side): Handmade snacks and cold drinks. Bring your own cup to get NT$10 off!\n" +
          "• Zone C (East Side): Free bicycle repair corner (open 1:00 p.m. – 4:00 p.m. only).\n" +
          "• Info Desk (Center): Lost & found and mobile payment help desk.\n" +
          "* Market hours: 10:00 a.m. – 5:00 p.m.",
        glossary: "secondhand 二手的；mobile payment 行動支付",
        stem: "Claire arrives at the market at 11:00 a.m. with her own cup and a phone for mobile payment, but she has no cash. Which activity can she do right away?",
        options: {
          A: "Buy a secondhand board game in Zone A.",
          B: "Get a NT$10 discount on a cold drink in Zone B.",
          C: "Have her bicycle fixed for free in Zone C.",
          D: "Buy a cloth bag at the Info Desk in the center."
        },
        answer: "B",
        explanation:
          "Claire 上午 11:00 抵達市集，自備環保杯且使用行動支付，可立刻至 B 區購買冷飲並享自備杯折價 10 元，故 (B) 正確。(A) A 區僅收現金（Cash only）；(C) C 區免費修車下午 1:00 才開始；(D) 環保袋是在南門入口免費領取，並非在服務台購買。",
        isCustom: false,
        checklist: createEmptyChecklist(),
        reviewStatus: "pending",
        reviewerName: "",
        reviewNotes: "",
        revisionSuggestions: "",
        updatedAt: "",
        history: []
      },
      {
        id: "DEMO-07",
        grade: "國中一年級",
        type: "閱讀理解",
        topic: "台灣濕地候鳥生態（黑面琵鷺）",
        difficulty: "基礎（CEFR A1+–A2）",
        objective: "能理解自然科普短文的因果句並辨識正確語意轉述",
        passageLabel: "科普閱讀短文",
        passage:
          "Every winter, hundreds of black-faced spoonbills fly from the cold north to southern Taiwan. They stay near shallow wetlands where they can easily find small fish and shrimp. When they look for food, they walk slowly in the water and move their long, flat bills from side to side. Because their bills are very sensitive to touch, the birds can feel food even in muddy water. In spring, after the weather gets warmer, they fly north again to raise their babies.",
        glossary: "black-faced spoonbill 黑面琵鷺；shallow 淺的；wetland 濕地；bill 鳥喙；sensitive 敏銳的",
        stem: "How do black-faced spoonbills find food in muddy water?",
        options: {
          A: "By feeling small animals with their bills.",
          B: "By diving deep into the ocean.",
          C: "By waiting for warmer weather in spring.",
          D: "By following larger fish across the wetland."
        },
        answer: "A",
        explanation:
          "文中說明黑面琵鷺的鳥喙觸覺敏銳（Because their bills are very sensitive to touch, the birds can feel food even in muddy water.），因此能以鳥喙感測小魚蝦，(A) 為正確語意轉述。(B) 牠們棲息於淺水濕地而非潛入深海；(C) 春天回暖是北返育雛時機；(D) 文中未提及跟隨大魚。",
        isCustom: false,
        checklist: createEmptyChecklist(),
        reviewStatus: "pending",
        reviewerName: "",
        reviewNotes: "",
        revisionSuggestions: "",
        updatedAt: "",
        history: []
      },
      {
        id: "DEMO-08",
        grade: "國中二年級",
        type: "閱讀理解",
        topic: "校園無螢幕午餐計畫",
        difficulty: "中等（CEFR A2+）",
        objective: "能從上下文情節線索推論慣用語意義，避免字面直譯誤判",
        passageLabel: "校園專題短文",
        passage:
          "Last month, our school started a \"Screen-Free Lunch\" plan. At first, many students complained because they could not watch short videos or check messages while eating. However, after two weeks, the cafeteria became much livelier. Students started sharing jokes, talking about club activities, and even trading snacks with classmates they rarely spoke to before. Many teachers noticed that the plan really broke the ice among students from different classes.",
        glossary: "cafeteria 學生餐廳",
        stem: "What does \"broke the ice\" most likely mean in the reading?",
        options: {
          A: "Made the cafeteria colder during lunch.",
          B: "Stopped students from bringing cold drinks to school.",
          C: "Caused students to argue about school rules.",
          D: "Helped students feel more comfortable talking to one another."
        },
        answer: "D",
        explanation:
          "由前文「學生開始分享笑話、聊社團，甚至與原本鮮少交談的同學交換點心」可推論，broke the ice 意指「打破沉默與隔閡，讓彼此更自在互動」，故選 (D)。(A)、(B) 皆為針對 ice 的字面直譯陷阱；(C) 與餐廳氣氛變得熱絡友善的文意相反。",
        isCustom: false,
        checklist: createEmptyChecklist(),
        reviewStatus: "pending",
        reviewerName: "",
        reviewNotes: "",
        revisionSuggestions: "",
        updatedAt: "",
        history: []
      },
      {
        id: "DEMO-09",
        grade: "國中三年級",
        type: "閱讀理解",
        topic: "課堂平板教學雙觀點專欄",
        difficulty: "進階（CEFR A2+–B1-）",
        objective: "能閱讀正反雙觀點短文並正確統整兩位作者共同認同的核心立場",
        passageLabel: "雙觀點校園專欄",
        passage:
          "[Viewpoint A — by Nora Lin]\n" +
          "Using tablets in class helps students learn faster. When we study geography or science, we can zoom in on maps and watch 3D models right away. Also, carrying one light tablet is much easier than carrying five heavy textbooks. Of course, teachers need clear rules so students don't play games during class.\n\n" +
          "[Viewpoint B — by David Wu]\n" +
          "I am not sure tablets should replace paper textbooks. Staring at screens for hours makes my eyes tired, and taking notes by hand actually helps me remember key ideas better. Still, I agree that clear classroom rules are needed whenever students use digital devices at school.",
        glossary: "tablet 平板電腦；replace 取代；digital device 數位裝置",
        stem: "What idea do Nora Lin and David Wu BOTH agree on?",
        options: {
          A: "Paper textbooks should be replaced by tablets soon.",
          B: "Taking notes on a tablet helps students remember better.",
          C: "Schools need clear rules for students using devices in class.",
          D: "Reading on screens for a long time does not hurt students' eyes."
        },
        answer: "C",
        explanation:
          "Nora 文末指出老師需要明確規範防止上課玩遊戲，David 亦在文末表示同意「在校使用數位裝置時需要明確課堂規則（clear classroom rules are needed）」，兩者共識為 (C)。(A) David 反對全面取代紙本課本；(B) David 認為手寫筆記更助記憶；(D) David 指出長時間看螢幕會讓眼睛疲勞。",
        isCustom: false,
        checklist: createEmptyChecklist(),
        reviewStatus: "pending",
        reviewerName: "",
        reviewNotes: "",
        revisionSuggestions: "",
        updatedAt: "",
        history: []
      }
    ];
  }

  // 應用程式狀態
  const state = {
    questions: [],
    selectedId: null,
    showAnswer: true,
    filters: {
      grade: "all",
      type: "all",
      status: "all",
      keyword: ""
    }
  };

  // DOM 參照
  const el = {
    statTotal: document.getElementById("statTotal"),
    statPending: document.getElementById("statPending"),
    statRevision: document.getElementById("statRevision"),
    statApproved: document.getElementById("statApproved"),
    progressSummaryText: document.getElementById("progressSummaryText"),
    distributionChips: document.getElementById("distributionChips"),
    qaProgressBarWrap: document.getElementById("qaProgressBarWrap"),
    qaProgressFill: document.getElementById("qaProgressFill"),

    cfgGrade: document.getElementById("cfgGrade"),
    cfgType: document.getElementById("cfgType"),
    cfgCount: document.getElementById("cfgCount"),
    cfgDifficulty: document.getElementById("cfgDifficulty"),
    cfgTopic: document.getElementById("cfgTopic"),
    genPromptOutput: document.getElementById("genPromptOutput"),

    filterGrade: document.getElementById("filterGrade"),
    filterType: document.getElementById("filterType"),
    filterStatus: document.getElementById("filterStatus"),
    filterKeyword: document.getElementById("filterKeyword"),
    listCountText: document.getElementById("listCountText"),
    questionList: document.getElementById("questionList"),

    emptyDetailState: document.getElementById("emptyDetailState"),
    activeDetailContent: document.getElementById("activeDetailContent"),
    detailMetaBadges: document.getElementById("detailMetaBadges"),
    detailObjective: document.getElementById("detailObjective"),
    detailPassageBox: document.getElementById("detailPassageBox"),
    detailPassageLabel: document.getElementById("detailPassageLabel"),
    detailPassageText: document.getElementById("detailPassageText"),
    detailGlossary: document.getElementById("detailGlossary"),
    detailStem: document.getElementById("detailStem"),
    detailOptions: document.getElementById("detailOptions"),
    detailAnswerBox: document.getElementById("detailAnswerBox"),
    detailAnswer: document.getElementById("detailAnswer"),
    detailOriginTag: document.getElementById("detailOriginTag"),
    detailExplanation: document.getElementById("detailExplanation"),
    btnToggleAnswer: document.getElementById("btnToggleAnswer"),
    btnDeleteCustom: document.getElementById("btnDeleteCustom"),

    qaSummaryStrip: document.getElementById("qaSummaryStrip"),
    checklistContainer: document.getElementById("checklistContainer"),

    reviewForm: document.getElementById("reviewForm"),
    reviewerName: document.getElementById("reviewerName"),
    reviewNotes: document.getElementById("reviewNotes"),
    revisionSuggestions: document.getElementById("revisionSuggestions"),
    reviewLastUpdated: document.getElementById("reviewLastUpdated"),
    approvalGuardAlert: document.getElementById("approvalGuardAlert"),
    reviewHistoryList: document.getElementById("reviewHistoryList"),

    addDraftModal: document.getElementById("addDraftModal"),
    addDraftForm: document.getElementById("addDraftForm"),
    reportModal: document.getElementById("reportModal"),
    reportContent: document.getElementById("reportContent"),
    toast: document.getElementById("toast")
  };

  /* -------------------- 工具函式 -------------------- */

  function loadQuestions() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(normalizeQuestion);
        }
      }
    } catch (err) {
      console.warn("讀取 localStorage 失敗，改用預設示範資料：", err);
    }
    const defaults = getDefaultQuestions();
    saveQuestions(defaults);
    return defaults;
  }

  function normalizeQuestion(q) {
    const baseChecklist = createEmptyChecklist();
    const mergedChecklist = Object.assign(baseChecklist, q.checklist || {});
    return {
      id: String(q.id || "ITEM"),
      grade: q.grade || "國中一年級",
      type: q.type || "文法選擇題",
      topic: q.topic || "未命名主題",
      difficulty: q.difficulty || "中等（CEFR A2+）",
      objective: q.objective || "",
      passageLabel: q.passageLabel || "",
      passage: q.passage || "",
      glossary: q.glossary || "",
      stem: q.stem || "",
      options: q.options || { A: "", B: "", C: "", D: "" },
      answer: q.answer || "A",
      explanation: q.explanation || "",
      isCustom: Boolean(q.isCustom),
      checklist: mergedChecklist,
      reviewStatus: STATUS_LABELS[q.reviewStatus] ? q.reviewStatus : "pending",
      reviewerName: q.reviewerName || "",
      reviewNotes: q.reviewNotes || "",
      revisionSuggestions: q.revisionSuggestions || "",
      updatedAt: q.updatedAt || "",
      history: Array.isArray(q.history) ? q.history : []
    };
  }

  function saveQuestions(questions) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
    } catch (err) {
      console.error("寫入 localStorage 失敗：", err);
      showToast("無法儲存至瀏覽器 localStorage，請確認瀏覽器隱私設定。");
    }
  }

  function formatDateTime(date) {
    const d = date instanceof Date ? date : new Date(date);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  let toastTimer = null;
  function showToast(message) {
    el.toast.textContent = message;
    el.toast.hidden = false;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.toast.hidden = true;
    }, 3000);
  }

  function copyToClipboard(text, successMsg) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(text)
        .then(() => showToast(successMsg))
        .catch(() => fallbackCopy(text, successMsg));
    } else {
      fallbackCopy(text, successMsg);
    }
  }

  function fallbackCopy(text, successMsg) {
    const temp = document.createElement("textarea");
    temp.value = text;
    temp.style.position = "fixed";
    temp.style.opacity = "0";
    document.body.appendChild(temp);
    temp.focus();
    temp.select();
    try {
      const ok = document.execCommand("copy");
      showToast(ok ? successMsg : "複製失敗，請手動選取文字複製。");
    } catch (err) {
      showToast("複製失敗，請手動選取文字複製。");
    }
    document.body.removeChild(temp);
  }

  function getChecklistStats(checklist) {
    let pass = 0;
    let issue = 0;
    let unchecked = 0;
    CHECKLIST_ITEMS.forEach((item) => {
      const val = checklist[item.key] || "unchecked";
      if (val === "pass") pass += 1;
      else if (val === "issue") issue += 1;
      else unchecked += 1;
    });
    return { pass, issue, unchecked, total: CHECKLIST_ITEMS.length };
  }

  function getFilteredQuestions() {
    const kw = state.filters.keyword.trim().toLowerCase();
    return state.questions.filter((q) => {
      if (state.filters.grade !== "all" && q.grade !== state.filters.grade) return false;
      if (state.filters.type !== "all" && q.type !== state.filters.type) return false;
      if (state.filters.status !== "all" && q.reviewStatus !== state.filters.status) return false;
      if (kw) {
        const haystack = [q.id, q.topic, q.objective, q.stem, q.passage, q.explanation]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(kw)) return false;
      }
      return true;
    });
  }

  function getSelectedQuestion() {
    return state.questions.find((q) => q.id === state.selectedId) || null;
  }

  /* -------------------- 提示詞組裝 -------------------- */

  function buildGenerationPrompt() {
    const grade = el.cfgGrade.value;
    const type = el.cfgType.value;
    const count = el.cfgCount.value;
    const difficulty = el.cfgDifficulty.value;
    const topic = el.cfgTopic.value.trim() || "日常生活情境";

    const typeGuide = {
      文法選擇題:
        "每題須包含 1–2 句完整生活情境或簡短兩人對話，禁止無語境孤立填空；鎖定單一核心文法或搭配詞考點（如時態、子句、代名詞、附加問句、介系詞），並針對台灣學生常見中文直譯迷思設計合理干擾項。",
      閱讀理解:
        "請先撰寫 100% 原創英文閱讀短文（140–220 字，可依需求採單篇科普／敘事或雙觀點對照），再設計對應選擇題；題型混合訊息轉述、推論主旨、詞義推敲或跨段落統整，正解須以語意轉述呈現，勿逐字照抄原文。",
      情境式閱讀題:
        "請設計貼近真實生活的非連續應用文本（如活動海報、社團公告、借閱規則、市集導覽或網頁步驟，含明確時間／地點／限制條件），再命製需套用條件篩選與規則邊界判讀之選擇題。"
    }[type];

    return [
      "你是一位熟悉台灣十二年國教國中英語領綱與素養導向閱讀評量的專業英文命題專家。",
      "請根據以下規格，撰寫 100% 原創之國中英文試題草稿（嚴禁改寫或沿用任何歷屆會考／基測原題或市售教材）：",
      "",
      "【命題規格】",
      `- 適用年級：${grade}`,
      `- 題型類別：${type}`,
      `- 命題主題：${topic}`,
      `- 題目數量：${count} 題`,
      `- 難度分級：${difficulty}`,
      "",
      "【命題品質要求】",
      `1. 題型設計重點：${typeGuide}`,
      "2. 字彙控管：以教育部國中小 1,200 基礎字彙為主；若有超出範圍但非「語境猜詞考點」之必要單字，請在文本下方以「[註] 英文 中文」加註繁體中文；若為猜詞考點則不加註。",
      "3. 選項設計：每題皆為四選一（A/B/C/D），四個選項詞性、結構與長度須盡量平行，干擾項須具合理誘答力，且整組題目正確答案字母應盡量均勻分布。",
      "4. 完整解析：每題均須附上繁體中文詳解，明確指出正確答案的文本證據或文法規則，並逐一說明其餘三個選項為何不正確。",
      "5. 教材目標：每題標註對應的「教材學習目標」。",
      "",
      "【輸出格式】",
      "請依序輸出每一題的：題號｜教材學習目標｜閱讀文本／情境內容（如適用）｜超綱詞中文加註｜英文題目｜選項 (A)(B)(C)(D)｜正確答案｜繁體中文解析。"
    ].join("\n");
  }

  function buildIndependentReviewPrompt(q) {
    const passageSection = q.passage
      ? `【閱讀文本／情境內容】\n${q.passage}\n${q.glossary ? `【中文加註】${q.glossary}\n` : ""}`
      : "【閱讀文本／情境內容】無（單題）\n";

    return [
      "你現在擔任「獨立英文教材品質檢核專家（Adversarial QA Reviewer）」，請在不知道命題過程的前提下，嚴格挑錯並審查以下國中英文試題草稿。",
      "切勿過度客氣；只要發現語法不自然、潛在雙解、干擾項瑕疵、解析矛盾或難度失準，請務必具體指出並提出修改建議。",
      "",
      "【待檢核題目資料】",
      `- 題號：${q.id}`,
      `- 適用年級：${q.grade}`,
      `- 題型與難度：${q.type}｜${q.difficulty}`,
      `- 主題：${q.topic}`,
      `- 教材學習目標：${q.objective}`,
      "",
      passageSection,
      `【英文題幹】\n${q.stem}`,
      "",
      "【選項】",
      `(A) ${q.options.A}`,
      `(B) ${q.options.B}`,
      `(C) ${q.options.C}`,
      `(D) ${q.options.D}`,
      "",
      `【原設定正確答案】(${q.answer})`,
      `【原設定繁體中文解析】\n${q.explanation}`,
      "",
      "【請逐項檢核以下 6 大指標，每項標註「通過」或「有疑慮」並說明理由】",
      "1. 文法與拼字正確性：英文語法、時態、搭配詞、標點、拼字與母語自然度是否完全無誤？",
      "2. 答案是否唯一：是否存在第二個可合理成立的選項，或需仰賴文外冷門常識才能作答？",
      "3. 干擾選項是否合理：四個選項詞性與長度是否平行？干擾項是否具教學誘答力，而非荒謬送分項？",
      "4. 答案與解析是否一致：解析是否與正確答案完全一致，且清楚拆解其餘三個選項之錯因？",
      "5. 難度是否適合年級：字彙難度（國中小 1,200 基礎字表）、句長與超綱詞加註是否符合該年級？",
      "6. 是否符合教材學習目標：本題是否確實評量上述教材學習目標？",
      "",
      "【最終結論】請給予整體判定（建議核准／需修改）與具體修訂建議（繁體中文）。"
    ].join("\n");
  }

  function buildBlindSolvePrompt(q) {
    const passageSection = q.passage
      ? `【閱讀文本／情境內容】\n${q.passage}\n${q.glossary ? `【中文加註】${q.glossary}\n` : ""}`
      : "";

    return [
      "你是一位嚴謹的國中英文審題測試員。以下題目已刻意隱藏參考答案，請執行「盲解測試（Blind-Solving Test）」：",
      "1. 請完全依據提供的文本與題幹作答，選出唯一最佳答案。",
      "2. 請逐一說明為何其餘三個選項不成立。",
      "3. 若你認為有超過一個選項在語法或語意上皆可成立，或題意有歧義，請明確指出爭議點。",
      "",
      passageSection,
      `【題目】\n${q.stem}`,
      "",
      `(A) ${q.options.A}`,
      `(B) ${q.options.B}`,
      `(C) ${q.options.C}`,
      `(D) ${q.options.D}`
    ].join("\n");
  }

  /* -------------------- 畫面渲染 -------------------- */

  function renderDashboard() {
    const total = state.questions.length;
    const pending = state.questions.filter((q) => q.reviewStatus === "pending").length;
    const revision = state.questions.filter((q) => q.reviewStatus === "needs_revision").length;
    const approved = state.questions.filter((q) => q.reviewStatus === "approved").length;

    const fullCheckedCount = state.questions.filter(
      (q) => getChecklistStats(q.checklist).pass === CHECKLIST_ITEMS.length
    ).length;
    const pct = total > 0 ? Math.round((fullCheckedCount / total) * 100) : 0;

    el.statTotal.textContent = String(total);
    el.statPending.textContent = String(pending);
    el.statRevision.textContent = String(revision);
    el.statApproved.textContent = String(approved);

    el.progressSummaryText.textContent = `6 項品質檢核全數通過：${fullCheckedCount} / ${total} 題（${pct}%）`;
    el.qaProgressBarWrap.setAttribute("aria-valuenow", String(pct));
    el.qaProgressFill.style.width = `${pct}%`;

    const typeCounts = {
      文法選擇題: 0,
      閱讀理解: 0,
      情境式閱讀題: 0
    };
    state.questions.forEach((q) => {
      if (Object.prototype.hasOwnProperty.call(typeCounts, q.type)) {
        typeCounts[q.type] += 1;
      }
    });

    el.distributionChips.innerHTML = Object.entries(typeCounts)
      .map(([name, count]) => `<span class="dist-chip">${escapeHtml(name)}：${count} 題</span>`)
      .join("");
  }

  function renderQuestionList() {
    const filtered = getFilteredQuestions();
    el.listCountText.textContent = `顯示 ${filtered.length} / ${state.questions.length} 題`;

    if (filtered.length === 0) {
      el.questionList.innerHTML = `<div class="empty-state"><p>無符合條件的題目</p></div>`;
      state.selectedId = null;
      renderDetail();
      return;
    }

    if (!filtered.some((q) => q.id === state.selectedId)) {
      state.selectedId = filtered[0].id;
    }

    el.questionList.innerHTML = filtered
      .map((q) => {
        const stats = getChecklistStats(q.checklist);
        const isActive = q.id === state.selectedId;
        const qaLabel =
          stats.issue > 0
            ? `有疑慮 ${stats.issue}`
            : stats.pass === stats.total
            ? `檢核 6/6`
            : `檢核 ${stats.pass}/6`;

        return `
          <button
            type="button"
            class="q-list-item ${isActive ? "active" : ""}"
            data-id="${escapeHtml(q.id)}"
            role="option"
            aria-selected="${isActive ? "true" : "false"}"
          >
            <div class="q-item-top">
              <span class="q-item-id">${escapeHtml(q.id)}</span>
              <span class="badge badge-${escapeHtml(q.reviewStatus)}">${escapeHtml(STATUS_LABELS[q.reviewStatus])}</span>
            </div>
            <div class="q-item-topic">${escapeHtml(q.topic)}</div>
            <div class="q-item-meta">
              <span>${escapeHtml(q.grade)} · ${escapeHtml(q.type)}</span>
              <span>${escapeHtml(qaLabel)}</span>
            </div>
          </button>
        `;
      })
      .join("");

    renderDetail();
  }

  function renderDetail() {
    const q = getSelectedQuestion();
    if (!q) {
      el.emptyDetailState.hidden = false;
      el.activeDetailContent.hidden = true;
      return;
    }

    el.emptyDetailState.hidden = true;
    el.activeDetailContent.hidden = false;

    // 頂部標籤
    el.detailMetaBadges.innerHTML = `
      <span class="badge badge-navy">${escapeHtml(q.id)}</span>
      <span class="badge badge-navy">${escapeHtml(q.grade)}</span>
      <span class="badge badge-green">${escapeHtml(q.type)}</span>
      <span class="badge badge-navy">${escapeHtml(q.difficulty)}</span>
      <span class="badge badge-${escapeHtml(q.reviewStatus)}">${escapeHtml(STATUS_LABELS[q.reviewStatus])}</span>
    `;

    el.btnDeleteCustom.hidden = !q.isCustom;
    el.detailObjective.textContent = q.objective || "（未填寫）";

    // 閱讀文本
    if (q.passage && q.passage.trim()) {
      el.detailPassageBox.hidden = false;
      el.detailPassageLabel.textContent = q.passageLabel || `${q.type}素材`;
      el.detailPassageText.textContent = q.passage;
      if (q.glossary && q.glossary.trim()) {
        el.detailGlossary.hidden = false;
        el.detailGlossary.textContent = `詞彙加註：${q.glossary}`;
      } else {
        el.detailGlossary.hidden = true;
      }
    } else {
      el.detailPassageBox.hidden = true;
    }

    // 題幹與選項
    el.detailStem.textContent = q.stem;
    el.detailOptions.innerHTML = ["A", "B", "C", "D"]
      .map((key) => {
        const highlight = state.showAnswer && q.answer === key;
        return `
          <li class="option-item ${highlight ? "is-correct" : ""}">
            <span class="option-key">(${key})</span>
            <span>${escapeHtml(q.options[key] || "")}</span>
          </li>
        `;
      })
      .join("");

    el.detailAnswerBox.hidden = !state.showAnswer;
    el.btnToggleAnswer.textContent = state.showAnswer ? "隱藏答案與解析" : "顯示答案與解析";
    el.detailAnswer.textContent = `(${q.answer})`;
    el.detailOriginTag.textContent = q.isCustom ? "使用者自建草稿" : "原創示範題（非會考原題）";
    el.detailExplanation.textContent = q.explanation;

    // 6 項品質檢核表
    renderChecklist(q);

    // 人工審核表單
    const statusRadios = el.reviewForm.querySelectorAll('input[name="reviewStatus"]');
    statusRadios.forEach((radio) => {
      radio.checked = radio.value === q.reviewStatus;
    });
    el.reviewerName.value = q.reviewerName || "";
    el.reviewNotes.value = q.reviewNotes || "";
    el.revisionSuggestions.value = q.revisionSuggestions || "";
    el.reviewLastUpdated.textContent = q.updatedAt ? `最後更新：${q.updatedAt}` : "尚未儲存審核紀錄";

    updateApprovalGuard(q, q.reviewStatus);
    renderHistory(q);
  }

  function renderChecklist(q) {
    const stats = getChecklistStats(q.checklist);
    el.qaSummaryStrip.innerHTML = `
      <span style="color: var(--green-700);">通過：${stats.pass} / ${stats.total}</span>
      <span style="color: var(--red-700);">有疑慮：${stats.issue} / ${stats.total}</span>
      <span style="color: var(--slate-700);">尚未檢核：${stats.unchecked} / ${stats.total}</span>
    `;

    el.checklistContainer.innerHTML = CHECKLIST_ITEMS.map((item) => {
      const current = q.checklist[item.key] || "unchecked";
      return `
        <div class="checklist-row state-${escapeHtml(current)}">
          <div class="checklist-info">
            <span class="checklist-title">${escapeHtml(item.label)}</span>
            <span class="checklist-hint">${escapeHtml(item.hint)}</span>
          </div>
          <div class="tri-toggle" role="group" aria-label="${escapeHtml(item.label)}">
            <button
              type="button"
              class="tri-btn ${current === "unchecked" ? "active-unchecked" : ""}"
              data-check-key="${escapeHtml(item.key)}"
              data-check-val="unchecked"
            >尚未檢核</button>
            <button
              type="button"
              class="tri-btn ${current === "pass" ? "active-pass" : ""}"
              data-check-key="${escapeHtml(item.key)}"
              data-check-val="pass"
            >通過</button>
            <button
              type="button"
              class="tri-btn ${current === "issue" ? "active-issue" : ""}"
              data-check-key="${escapeHtml(item.key)}"
              data-check-val="issue"
            >有疑慮</button>
          </div>
        </div>
      `;
    }).join("");
  }

  function updateApprovalGuard(q, selectedStatus) {
    const stats = getChecklistStats(q.checklist);
    if (selectedStatus === "approved" && stats.pass < stats.total) {
      const missing = CHECKLIST_ITEMS.filter((it) => q.checklist[it.key] !== "pass")
        .map((it) => `${it.label}（${CHECK_STATE_LABELS[q.checklist[it.key] || "unchecked"]}）`)
        .join("、");
      el.approvalGuardAlert.hidden = false;
      el.approvalGuardAlert.textContent = `品質門檻提醒：尚有 ${stats.total - stats.pass} 項未標示為「通過」，無法核准上架。未通過項目：${missing}。`;
      return false;
    }
    el.approvalGuardAlert.hidden = true;
    el.approvalGuardAlert.textContent = "";
    return true;
  }

  function renderHistory(q) {
    if (!q.history || q.history.length === 0) {
      el.reviewHistoryList.innerHTML = `<li class="history-item"><span>尚無人工審核紀錄（目前為初始未檢核狀態）。</span></li>`;
      return;
    }
    el.reviewHistoryList.innerHTML = q.history
      .slice(0, 6)
      .map(
        (entry) => `
          <li class="history-item">
            <span>
              <strong>${escapeHtml(STATUS_LABELS[entry.status] || entry.status)}</strong>
              ｜${escapeHtml(entry.reviewer || "未具名編輯")}
              （通過 ${entry.passCount}/6、有疑慮 ${entry.issueCount}/6）
              ${entry.note ? `— ${escapeHtml(entry.note)}` : ""}
            </span>
            <span>${escapeHtml(entry.time)}</span>
          </li>
        `
      )
      .join("");
  }

  /* -------------------- CSV 匯出與品質檢核報告 -------------------- */

  function csvEscape(val) {
    const str = String(val === undefined || val === null ? "" : val).replace(/\r?\n/g, " ");
    return `"${str.replace(/"/g, '""')}"`;
  }

  function exportCsv() {
    const headers = [
      "題號",
      "來源類型",
      "年級",
      "題型",
      "主題",
      "難度",
      "教材學習目標",
      "閱讀文本",
      "題目",
      "選項A",
      "選項B",
      "選項C",
      "選項D",
      "正確答案",
      "繁體中文解析",
      "1.文法與拼字正確性",
      "2.答案是否唯一",
      "3.干擾選項是否合理",
      "4.答案與解析是否一致",
      "5.難度是否適合年級",
      "6.是否符合教材學習目標",
      "審核狀態",
      "審核人員",
      "審核備註",
      "修訂建議",
      "最後更新時間"
    ];

    const rows = state.questions.map((q) => [
      q.id,
      q.isCustom ? "自建草稿" : "原創示範題",
      q.grade,
      q.type,
      q.topic,
      q.difficulty,
      q.objective,
      q.passage,
      q.stem,
      q.options.A,
      q.options.B,
      q.options.C,
      q.options.D,
      q.answer,
      q.explanation,
      CHECK_STATE_LABELS[q.checklist.grammarSpelling] || "尚未檢核",
      CHECK_STATE_LABELS[q.checklist.uniqueAnswer] || "尚未檢核",
      CHECK_STATE_LABELS[q.checklist.reasonableDistractors] || "尚未檢核",
      CHECK_STATE_LABELS[q.checklist.explanationMatch] || "尚未檢核",
      CHECK_STATE_LABELS[q.checklist.gradeDifficulty] || "尚未檢核",
      CHECK_STATE_LABELS[q.checklist.learningObjective] || "尚未檢核",
      STATUS_LABELS[q.reviewStatus] || "待審核",
      q.reviewerName,
      q.reviewNotes,
      q.revisionSuggestions,
      q.updatedAt
    ]);

    const csvContent =
      "\uFEFF" +
      [headers, ...rows].map((row) => row.map(csvEscape).join(",")).join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `AI英文命題品質檢核題庫_${stamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("已匯出 UTF-8 CSV 檔案（Excel 開啟不亂碼）。");
  }

  function renderReportModal() {
    const total = state.questions.length;
    const pending = state.questions.filter((q) => q.reviewStatus === "pending").length;
    const revision = state.questions.filter((q) => q.reviewStatus === "needs_revision").length;
    const approved = state.questions.filter((q) => q.reviewStatus === "approved").length;
    const fullPass = state.questions.filter(
      (q) => getChecklistStats(q.checklist).pass === CHECKLIST_ITEMS.length
    ).length;

    const tableRows = state.questions
      .map((q) => {
        const stats = getChecklistStats(q.checklist);
        const checkSummary = CHECKLIST_ITEMS.map((item, idx) => {
          const val = q.checklist[item.key] || "unchecked";
          const symbol = val === "pass" ? "✓" : val === "issue" ? "✗" : "—";
          return `${idx + 1}:${symbol}`;
        }).join(" ");

        return `
          <tr>
            <td><strong>${escapeHtml(q.id)}</strong></td>
            <td>${escapeHtml(q.grade)}<br>${escapeHtml(q.type)}</td>
            <td>${escapeHtml(q.topic)}</td>
            <td>${escapeHtml(checkSummary)}<br><small>通過 ${stats.pass}/6｜疑慮 ${stats.issue}｜未檢 ${stats.unchecked}</small></td>
            <td><span class="badge badge-${escapeHtml(q.reviewStatus)}">${escapeHtml(STATUS_LABELS[q.reviewStatus])}</span></td>
            <td>${escapeHtml(q.reviewerName || "—")}</td>
            <td>
              ${q.reviewNotes ? `<div><strong>備註：</strong>${escapeHtml(q.reviewNotes)}</div>` : ""}
              ${q.revisionSuggestions ? `<div><strong>建議：</strong>${escapeHtml(q.revisionSuggestions)}</div>` : ""}
              ${!q.reviewNotes && !q.revisionSuggestions ? "—" : ""}
            </td>
          </tr>
        `;
      })
      .join("");

    el.reportContent.innerHTML = `
      <div class="report-header-box">
        <h2>AI 英文智慧命題與教材檢核系統 — 品質檢核報告</h2>
        <div class="report-meta">
          產出時間：${escapeHtml(formatDateTime(new Date()))} ｜ 系統版本：第一版示範系統（本機離線）｜ 檢核符號：✓ 通過、✗ 有疑慮、— 尚未檢核
        </div>
      </div>

      <div class="report-kpi-row">
        <div class="report-kpi-box"><strong>${total}</strong><span>題目總數</span></div>
        <div class="report-kpi-box"><strong>${pending}</strong><span>待審核</span></div>
        <div class="report-kpi-box"><strong>${revision}</strong><span>需修改</span></div>
        <div class="report-kpi-box"><strong>${approved}</strong><span>已核准</span></div>
        <div class="report-kpi-box"><strong>${fullPass}</strong><span>6 項檢核全通過</span></div>
      </div>

      <table class="report-table">
        <thead>
          <tr>
            <th style="width: 80px;">題號</th>
            <th style="width: 115px;">年級／題型</th>
            <th style="width: 150px;">主題</th>
            <th style="width: 170px;">6 項檢核結果</th>
            <th style="width: 82px;">審核狀態</th>
            <th style="width: 90px;">審核人員</th>
            <th>審核備註與修訂建議</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>

      <p class="report-note-footer">
        註：1.文法與拼字正確性、2.答案是否唯一、3.干擾選項是否合理、4.答案與解析是否一致、5.難度是否適合年級、6.是否符合教材學習目標。本報告僅統計原創示範題庫與自建草稿，不含任何原始會考試題。
      </p>
    `;

    el.reportModal.hidden = false;
  }

  /* -------------------- 事件綁定 -------------------- */

  function refreshPromptPreview() {
    el.genPromptOutput.value = buildGenerationPrompt();
  }

  function bindEvents() {
    // 命題條件即時更新提示詞
    [el.cfgGrade, el.cfgType, el.cfgCount, el.cfgDifficulty].forEach((input) => {
      input.addEventListener("change", refreshPromptPreview);
    });
    el.cfgTopic.addEventListener("input", refreshPromptPreview);

    // 主題快捷按鈕
    document.querySelectorAll(".chip-btn[data-topic]").forEach((btn) => {
      btn.addEventListener("click", () => {
        el.cfgTopic.value = btn.getAttribute("data-topic") || "";
        refreshPromptPreview();
      });
    });

    // 複製 AI 命題提示詞
    const handleCopyGen = () => {
      copyToClipboard(
        el.genPromptOutput.value,
        "已複製 AI 原創命題提示詞！可直接貼至 ChatGPT 或 Gemini。"
      );
    };
    document.getElementById("btnCopyGenPrompt").addEventListener("click", handleCopyGen);
    document.getElementById("btnCopyGenPromptSmall").addEventListener("click", handleCopyGen);

    // 依條件篩選題庫
    document.getElementById("btnFilterByConfig").addEventListener("click", () => {
      state.filters.grade = el.cfgGrade.value;
      state.filters.type = el.cfgType.value;
      state.filters.status = "all";
      state.filters.keyword = "";
      el.filterGrade.value = state.filters.grade;
      el.filterType.value = state.filters.type;
      el.filterStatus.value = "all";
      el.filterKeyword.value = "";
      renderQuestionList();
      document.getElementById("review-workbench").scrollIntoView({ behavior: "smooth" });
      showToast(`已篩選：${state.filters.grade}｜${state.filters.type}`);
    });

    // 篩選器
    el.filterGrade.addEventListener("change", () => {
      state.filters.grade = el.filterGrade.value;
      renderQuestionList();
    });
    el.filterType.addEventListener("change", () => {
      state.filters.type = el.filterType.value;
      renderQuestionList();
    });
    el.filterStatus.addEventListener("change", () => {
      state.filters.status = el.filterStatus.value;
      renderQuestionList();
    });
    el.filterKeyword.addEventListener("input", () => {
      state.filters.keyword = el.filterKeyword.value;
      renderQuestionList();
    });
    document.getElementById("btnClearFilters").addEventListener("click", () => {
      state.filters = { grade: "all", type: "all", status: "all", keyword: "" };
      el.filterGrade.value = "all";
      el.filterType.value = "all";
      el.filterStatus.value = "all";
      el.filterKeyword.value = "";
      renderQuestionList();
    });

    // 選擇題目
    el.questionList.addEventListener("click", (e) => {
      const btn = e.target.closest(".q-list-item");
      if (!btn) return;
      state.selectedId = btn.getAttribute("data-id");
      renderQuestionList();
    });

    // 切換答案顯示（保留未儲存的審核表單輸入）
    el.btnToggleAnswer.addEventListener("click", () => {
      state.showAnswer = !state.showAnswer;
      const q = getSelectedQuestion();
      if (!q) return;
      el.detailOptions.innerHTML = ["A", "B", "C", "D"]
        .map((key) => {
          const highlight = state.showAnswer && q.answer === key;
          return `
            <li class="option-item ${highlight ? "is-correct" : ""}">
              <span class="option-key">(${key})</span>
              <span>${escapeHtml(q.options[key] || "")}</span>
            </li>
          `;
        })
        .join("");
      el.detailAnswerBox.hidden = !state.showAnswer;
      el.btnToggleAnswer.textContent = state.showAnswer ? "隱藏答案與解析" : "顯示答案與解析";
    });

    // 刪除自建草稿
    el.btnDeleteCustom.addEventListener("click", () => {
      const q = getSelectedQuestion();
      if (!q || !q.isCustom) return;
      if (!window.confirm(`確定要刪除自建草稿 ${q.id}（${q.topic}）嗎？此動作無法復原。`)) {
        return;
      }
      state.questions = state.questions.filter((item) => item.id !== q.id);
      saveQuestions(state.questions);
      state.selectedId = state.questions[0] ? state.questions[0].id : null;
      renderDashboard();
      renderQuestionList();
      showToast(`已刪除草稿 ${q.id}。`);
    });

    // 複製獨立 AI 檢核提示詞 & 盲解測試提示詞
    document.getElementById("btnCopyReviewPrompt").addEventListener("click", () => {
      const q = getSelectedQuestion();
      if (!q) return;
      copyToClipboard(
        buildIndependentReviewPrompt(q),
        `已複製 ${q.id} 的「獨立 AI 檢核提示詞」！建議貼至全新對話進行審查。`
      );
    });

    document.getElementById("btnCopyBlindPrompt").addEventListener("click", () => {
      const q = getSelectedQuestion();
      if (!q) return;
      copyToClipboard(
        buildBlindSolvePrompt(q),
        `已複製 ${q.id} 的「盲解測試提示詞」（已隱藏正解）。`
      );
    });

    // 6 項檢核三態切換（即時儲存並保留尚未送出的備註與建議輸入）
    el.checklistContainer.addEventListener("click", (e) => {
      const btn = e.target.closest(".tri-btn");
      if (!btn) return;
      const q = getSelectedQuestion();
      if (!q) return;

      const key = btn.getAttribute("data-check-key");
      const val = btn.getAttribute("data-check-val");
      if (!key || !CHECK_STATE_LABELS[val]) return;

      // 暫存表單上尚未送出的編輯文字與選取狀態
      const draftReviewer = el.reviewerName.value;
      const draftNotes = el.reviewNotes.value;
      const draftSuggestions = el.revisionSuggestions.value;
      const checkedRadio = el.reviewForm.querySelector('input[name="reviewStatus"]:checked');
      let draftStatus = checkedRadio ? checkedRadio.value : q.reviewStatus;

      q.checklist[key] = val;
      // 若已核准題目被改回非通過狀態，自動降回待審核以維持品質門檻一致性
      if (q.reviewStatus === "approved" && val !== "pass") {
        q.reviewStatus = "pending";
        draftStatus = "pending";
        showToast("檢核狀態變更為非通過，本題審核狀態已自動調整回「待審核」。");
      }

      saveQuestions(state.questions);
      renderDashboard();
      renderQuestionList();

      // 還原表單上尚未送出的編輯文字與選項
      el.reviewerName.value = draftReviewer;
      el.reviewNotes.value = draftNotes;
      el.revisionSuggestions.value = draftSuggestions;
      el.reviewForm.querySelectorAll('input[name="reviewStatus"]').forEach((radio) => {
        radio.checked = radio.value === draftStatus;
      });
      updateApprovalGuard(q, draftStatus);
    });

    // 審核狀態單選即時檢查品質門檻
    el.reviewForm.addEventListener("change", (e) => {
      if (e.target.name === "reviewStatus") {
        const q = getSelectedQuestion();
        if (q) updateApprovalGuard(q, e.target.value);
      }
    });

    // 儲存人工審核紀錄
    el.reviewForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = getSelectedQuestion();
      if (!q) return;

      const checkedRadio = el.reviewForm.querySelector('input[name="reviewStatus"]:checked');
      const nextStatus = checkedRadio ? checkedRadio.value : "pending";

      if (!updateApprovalGuard(q, nextStatus)) {
        showToast("無法設為「已核准」：請先確認全部 6 項品質檢核皆標示為「通過」。");
        return;
      }

      const nowStr = formatDateTime(new Date());
      const stats = getChecklistStats(q.checklist);

      q.reviewStatus = nextStatus;
      q.reviewerName = el.reviewerName.value.trim();
      q.reviewNotes = el.reviewNotes.value.trim();
      q.revisionSuggestions = el.revisionSuggestions.value.trim();
      q.updatedAt = nowStr;
      q.history.unshift({
        time: nowStr,
        status: nextStatus,
        reviewer: q.reviewerName || "英文編輯",
        passCount: stats.pass,
        issueCount: stats.issue,
        note: q.reviewNotes || q.revisionSuggestions || ""
      });

      saveQuestions(state.questions);
      renderDashboard();
      renderQuestionList();
      showToast(`已儲存 ${q.id} 的檢核與審核紀錄（${STATUS_LABELS[nextStatus]}）。`);
    });

    // 重設本題檢核狀態
    document.getElementById("btnResetItemQa").addEventListener("click", () => {
      const q = getSelectedQuestion();
      if (!q) return;
      if (!window.confirm(`確定要將 ${q.id} 的 6 項檢核狀態重設為「尚未檢核」並回復「待審核」嗎？`)) {
        return;
      }
      q.checklist = createEmptyChecklist();
      q.reviewStatus = "pending";
      saveQuestions(state.questions);
      renderDashboard();
      renderQuestionList();
      showToast(`已重設 ${q.id} 的品質檢核狀態。`);
    });

    // 開啟新增草稿 Modal
    const openAddModal = () => {
      el.addDraftForm.reset();
      document.getElementById("newGrade").value = el.cfgGrade.value;
      document.getElementById("newType").value = el.cfgType.value;
      document.getElementById("newDifficulty").value = el.cfgDifficulty.value;
      document.getElementById("newTopic").value = el.cfgTopic.value.trim();
      el.addDraftModal.hidden = false;
    };
    document.getElementById("btnAddDraftTop").addEventListener("click", openAddModal);
    document.getElementById("btnAddDraftList").addEventListener("click", openAddModal);

    // 儲存新增草稿
    el.addDraftForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const customNumbers = state.questions
        .map((item) => {
          const m = /^DRAFT-(\d+)$/.exec(item.id);
          return m ? Number(m[1]) : 0;
        })
        .reduce((max, n) => Math.max(max, n), 0);

      const newId = `DRAFT-${String(customNumbers + 1).padStart(2, "0")}`;
      const type = document.getElementById("newType").value;
      const passage = document.getElementById("newPassage").value.trim();

      const newItem = normalizeQuestion({
        id: newId,
        grade: document.getElementById("newGrade").value,
        type,
        difficulty: document.getElementById("newDifficulty").value,
        topic: document.getElementById("newTopic").value.trim(),
        objective: document.getElementById("newObjective").value.trim(),
        passageLabel: passage ? `${type}素材` : "",
        passage,
        glossary: document.getElementById("newGlossary").value.trim(),
        stem: document.getElementById("newStem").value.trim(),
        options: {
          A: document.getElementById("newOptA").value.trim(),
          B: document.getElementById("newOptB").value.trim(),
          C: document.getElementById("newOptC").value.trim(),
          D: document.getElementById("newOptD").value.trim()
        },
        answer: document.getElementById("newAnswer").value,
        explanation: document.getElementById("newExplanation").value.trim(),
        isCustom: true,
        checklist: createEmptyChecklist(),
        reviewStatus: "pending"
      });

      state.questions.unshift(newItem);
      saveQuestions(state.questions);

      // 清除篩選確保立即看到新題
      state.filters = { grade: "all", type: "all", status: "all", keyword: "" };
      el.filterGrade.value = "all";
      el.filterType.value = "all";
      el.filterStatus.value = "all";
      el.filterKeyword.value = "";
      state.selectedId = newItem.id;

      el.addDraftModal.hidden = true;
      renderDashboard();
      renderQuestionList();
      showToast(`已新增原創草稿 ${newId}（狀態：待審核，6 項預設尚未檢核）。`);
    });

    // 重設全部示範資料
    document.getElementById("btnResetDemo").addEventListener("click", () => {
      if (
        !window.confirm(
          "確定要重設全部示範資料嗎？這會清除所有審核紀錄與自建草稿，回復至初始 9 題未檢核狀態。"
        )
      ) {
        return;
      }
      const defaults = getDefaultQuestions();
      state.questions = defaults;
      state.selectedId = defaults[0].id;
      saveQuestions(defaults);
      renderDashboard();
      renderQuestionList();
      showToast("已回復至初始示範資料（9 題原創示範題，皆為尚未檢核）。");
    });

    // 匯出 CSV 與品質檢核報告
    document.getElementById("btnExportCsv").addEventListener("click", exportCsv);
    document.getElementById("btnExportCsvFromReport").addEventListener("click", exportCsv);
    document.getElementById("btnOpenReport").addEventListener("click", renderReportModal);
    document.getElementById("btnPrintReport").addEventListener("click", () => {
      window.print();
    });

    // 關閉 Modal
    document.querySelectorAll("[data-close-modal]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-close-modal");
        const modal = document.getElementById(id);
        if (modal) modal.hidden = true;
      });
    });

    [el.addDraftModal, el.reportModal].forEach((modal) => {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.hidden = true;
      });
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        el.addDraftModal.hidden = true;
        el.reportModal.hidden = true;
      }
    });
  }

  /* -------------------- 初始化 -------------------- */

  function init() {
    state.questions = loadQuestions();
    state.selectedId = state.questions[0] ? state.questions[0].id : null;
    refreshPromptPreview();
    renderDashboard();
    renderQuestionList();
    bindEvents();
  }

  init();
})();

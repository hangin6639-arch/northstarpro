import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import ModeSelector from './components/ModeSelector';
import AnalysisForm from './components/AnalysisForm';
import ResultsDisplay from './components/ResultsDisplay';
import OnboardingSurvey from './components/OnboardingSurvey';
import SubscriptionModal from './components/SubscriptionModal';
import { UserMode, AnalysisResponse, SavedReport, SurveyData } from './types';
import { analyzeUserGap } from './services/geminiService';

const COOLDOWN_SECONDS = 60;

// 🟢 [테스트용 가짜 데이터] API가 안 될 때 화면 확인용
const TEST_DATA: AnalysisResponse = {
  user_mode: UserMode.PRO_NAVIGATOR,
  persona_message: "당신은 이미 훌륭한 전략가입니다. 이제 실행만이 남았습니다.",
  input_analysis: {
    data_type: "text",
    vision_summary: "글로벌 테크 리더로의 도약",
    current_vector: "숙련된 전문가",
    target_vector: "업계 사상가(Thought Leader)"
  },
  gap_report: {
    similarity_score: 78,
    gap_summary: "기술적 역량은 충분하나, 네트워킹과 퍼스널 브랜딩이 필요함",
    missing_elements: [
      { item: "Global Network", impact: "해외 진출을 위한 필수 교두보" },
      { item: "Public Speaking", impact: "영향력 확대를 위한 스킬" },
      { item: "Tech Writing", impact: "지식 자산화 및 인지도 상승" }
    ],
    attributes: [
      { subject: '전문성', current: 90, target: 95 },
      { subject: '리더십', current: 70, target: 90 },
      { subject: '네트워크', current: 40, target: 85 },
      { subject: '자산', current: 60, target: 80 },
      { subject: '영향력', current: 30, target: 85 },
    ]
  },
  solution_card: {
    title: "글로벌 리더십 로드맵",
    action_type: "Network & Brand",
    quest: "주 1회 링크드인 아티클 발행하기",
    expected_result: "업계 인지도 30% 상승 예상",
    roadmap: [
      { title: "기반 다지기", description: "링크드인 프로필 최적화", detail: "영문 이력서 및 포트폴리오 업데이트", status: "completed", icon_type: "base" },
      { title: "네트워킹", description: "글로벌 컨퍼런스 참여", detail: "해외 연사들과의 관계 형성", status: "current", icon_type: "growth" },
      { title: "브랜딩", description: "전문 서적 출판", detail: "자신의 경험을 책으로 엮어 권위 확보", status: "upcoming", icon_type: "target" }
    ]
  },
  required_info_guide: ["현재 연봉 및 희망 연봉", "보유한 자격증 목록"],
  target_requirements: [
    { category: "비용", item: "MBA 학비", cost_or_condition: "약 5,000만원" },
    { category: "시간", item: "준비 기간", cost_or_condition: "1년 6개월" }
  ]
};

const App: React.FC = () => {
  const [selectedMode, setSelectedMode] = useState<UserMode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCountdown, setRetryCountdown] = useState<number>(0);
  const [archive, setArchive] = useState<SavedReport[]>([]);
  const [surveyData, setSurveyData] = useState<SurveyData | null>(null);
  const [showSurvey, setShowSurvey] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [activeModal, setActiveModal] = useState<'mission' | 'vision' | 'archive' | 'subscribe' | null>(null);
  
  const timerRef = useRef<any>(null);

  useEffect(() => {
    const savedArchive = localStorage.getItem('northstar_archive');
    if (savedArchive) {
      try {
        const parsed = JSON.parse(savedArchive);
        setArchive(parsed || []);
      } catch (e) {
        console.error("Failed to parse archive", e);
        setArchive([]);
      }
    }

    const savedPro = localStorage.getItem('northstar_is_pro');
    if (savedPro === 'true') {
      setIsPro(true);
    }

    const savedSurvey = localStorage.getItem('northstar_survey');
    if (savedSurvey) {
      try {
        const parsedSurvey = JSON.parse(savedSurvey);
        setSurveyData(parsedSurvey);
        if (parsedSurvey.ageGroup) {
          setSelectedMode(parsedSurvey.ageGroup as UserMode);
        }
      } catch (e) {
        console.error("Failed to parse survey", e);
        setShowSurvey(true);
      }
    } else {
      setShowSurvey(true);
    }
  }, []);

  useEffect(() => {
    if (retryCountdown > 0) {
      timerRef.current = setInterval(() => {
        setRetryCountdown((prev) => prev - 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (error && error.includes('충전')) setError(null);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [retryCountdown, error]);

  const handleSurveyComplete = (data: SurveyData) => {
    setSurveyData(data);
    localStorage.setItem('northstar_survey', JSON.stringify(data));
    setSelectedMode(data.ageGroup as UserMode);
    setShowSurvey(false);
  };

  const handleSubscribe = () => {
    setIsPro(true);
    localStorage.setItem('northstar_is_pro', 'true');
  };

  // 🧪 테스트 데이터 강제 주입 함수
  const loadTestData = () => {
    setResult(TEST_DATA);
    setTimeout(() => {
      const resultEl = document.getElementById('analysis-result');
      resultEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  const handleAnalyze = async (text: string, image: string | null) => {
    if (retryCountdown > 0) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await analyzeUserGap({
        text,
        image: image || undefined,
        mode: selectedMode || undefined,
        surveyContext: surveyData || undefined
      });
      setResult(response);
      
      const newReport: SavedReport = {
        ...response,
        id: Date.now().toString(),
        timestamp: new Date().toLocaleString('ko-KR')
      };
      const updatedArchive = [newReport, ...archive].slice(0, 20);
      setArchive(updatedArchive);
      localStorage.setItem('northstar_archive', JSON.stringify(updatedArchive));

      if (response.user_mode) {
        setSelectedMode(response.user_mode as UserMode);
      }
      
      setTimeout(() => {
        const resultEl = document.getElementById('analysis-result');
        resultEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);

    } catch (err: any) {
      console.error("[Analysis Error]", err);
      const errStr = JSON.stringify(err).toLowerCase() || err.message?.toLowerCase() || "";
      
      if (errStr.includes('429') || errStr.includes('resource_exhausted') || errStr.includes('quota')) {
        setError('엔진 분석 요청이 너무 많습니다. 60초 후에 다시 시도해 주세요.');
        setRetryCountdown(COOLDOWN_SECONDS);
      } else {
        setError(err.message || '엔진 분석 중 예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => setActiveModal(null);
  const cooldownPercentage = Math.round(((COOLDOWN_SECONDS - retryCountdown) / COOLDOWN_SECONDS) * 100);

  return (
    <div className="min-h-screen relative pb-24">
      <div className="star-bg"></div>
      
      {/* 🧪 테스트 버튼 (화면 우측 상단) */}
      <button 
        onClick={loadTestData}
        className="fixed top-24 right-4 z-50 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg animate-pulse"
      >
        🧪 테스트 데이터 보기
      </button>

      <Header onNavClick={setActiveModal} isPro={isPro} />

      {showSurvey && <OnboardingSurvey onComplete={handleSurveyComplete} />}
      
      {activeModal === 'subscribe' && (
        <SubscriptionModal 
          onClose={closeModal} 
          onSubscribe={handleSubscribe} 
          isPro={isPro} 
        />
      )}

      <main className="max-w-5xl mx-auto px-4 pt-32">
        <section className="text-center mb-16 space-y-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="inline-block px-4 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-black tracking-widest uppercase animate-pulse">
              Future Discovery Engine
            </div>
            {isPro && (
              <div className="px-4 py-1 bg-amber-500 text-slate-950 text-xs font-black tracking-widest uppercase rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                PRO ACTIVE
              </div>
            )}
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-tight">
            {surveyData ? `${surveyData.name}님의 꿈과 현실 사이,` : "당신의 꿈과 현실 사이,"}<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
              그 틈을 메우는 북극성
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            나이와 직업에 상관없이, 당신이 지금 서 있는 곳에서 <br className="hidden md:block" />
            목표하는 '진짜 나'로 가는 최단 경로를 설계해 드립니다.
          </p>
          {surveyData && (
            <div className="pt-4 flex justify-center space-x-6">
              <button 
                onClick={() => setShowSurvey(true)}
                className="flex items-center space-x-2 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-blue-400 transition-colors"
              >
                <i className="fa-solid fa-user-gear"></i>
                <span>프로필 및 목표 정보 수정하기</span>
              </button>
              {isPro && (
                <div className="flex items-center space-x-2 text-[10px] font-black text-amber-500 uppercase tracking-widest">
                  <i className="fa-solid fa-check-double"></i>
                  <span>프리미엄 엔진 활성화됨</span>
                </div>
              )}
            </div>
          )}
        </section>

        <section className="mb-20">
          <h2 className="text-slate-500 text-xs font-bold uppercase tracking-widest text-center mb-8">
            SELECT YOUR VECTOR MODE
          </h2>
          <ModeSelector 
            selectedMode={selectedMode} 
            onSelect={(mode) => {
              setSelectedMode(mode);
              setResult(null); 
            }} 
          />
          
          <div className="max-w-3xl mx-auto">
            <AnalysisForm 
              onAnalyze={handleAnalyze} 
              isLoading={isLoading || retryCountdown > 0} 
              activeMode={selectedMode}
            />
          </div>
        </section>

        {error && (
          <div className="max-w-3xl mx-auto mb-12 p-8 bg-slate-900/80 border border-slate-800 rounded-3xl text-center flex flex-col items-center space-y-6 animate-in fade-in slide-in-from-top-4 duration-500 shadow-2xl relative overflow-hidden">
            {retryCountdown > 0 && (
              <div className="absolute top-0 left-0 h-1 bg-blue-500/30 w-full">
                <div 
                  className="h-full bg-blue-500 transition-all duration-1000 ease-linear" 
                  style={{ width: `${cooldownPercentage}%` }}
                ></div>
              </div>
            )}
            
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${retryCountdown > 0 ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-400'}`}>
              <i className={`fa-solid ${retryCountdown > 0 ? 'fa-battery-half animate-pulse' : 'fa-triangle-exclamation'} text-2xl`}></i>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">
                {retryCountdown > 0 ? '에너지 충전 중...' : '시스템 알림'}
              </h3>
              <p className="text-slate-400 leading-relaxed max-w-md mx-auto">
                {error}
              </p>
            </div>

            {retryCountdown > 0 ? (
              <div className="flex flex-col items-center space-y-2">
                <div className="text-3xl font-black text-blue-400">
                  {retryCountdown}s
                </div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                  Until Engine Re-entry
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setError(null)}
                className="px-8 py-2 bg-slate-800 text-white text-sm font-bold rounded-full hover:bg-slate-700 transition-colors"
              >
                확인
              </button>
            )}
          </div>
        )}

        {/* 🟢 결과 화면: result 데이터가 있어야만 보입니다! */}
        {result && (
          <div id="analysis-result">
            <ResultsDisplay data={result} />
          </div>
        )}
      </main>

      {/* Modals */}
      {activeModal && activeModal !== 'subscribe' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={closeModal}></div>
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                  {activeModal === 'mission' && 'Our Mission'}
                  {activeModal === 'vision' && 'Future Vision'}
                  {activeModal === 'archive' && 'Analysis Archive'}
                </h2>
                <button onClick={closeModal} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors">
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {activeModal === 'mission' && (
                  <div className="space-y-6 text-slate-300">
                    <p className="text-lg leading-relaxed">
                      North Star Universe의 미션은 전 인류의 <span className="text-blue-400 font-bold">성장 격차(Gap)를 기술로 해소하는 것</span>입니다.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
                        <i className="fa-solid fa-magnifying-glass-chart text-blue-500 mb-2"></i>
                        <h4 className="font-bold text-white mb-1">데이터 기반 분석</h4>
                        <p className="text-sm">단순한 조언을 넘어, 객관적인 데이터로 현재의 위치를 맵핑합니다.</p>
                      </div>
                      <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
                        <i className="fa-solid fa-user-gear text-purple-500 mb-2"></i>
                        <h4 className="font-bold text-white mb-1">맞춤형 페르소나</h4>
                        <p className="text-sm">사용자의 생애 주기에 최적화된 엔진이 가장 효율적인 언어로 대화합니다.</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeModal === 'vision' && (
                  <div className="space-y-6 text-slate-300">
                    <div className="p-6 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-3xl border border-blue-500/20 mb-6">
                      <h3 className="text-xl font-bold text-white mb-2">Beyond AI, Into Growth</h3>
                      <p className="text-sm leading-relaxed">
                        우리는 단순히 질문에 답하는 AI를 넘어, 사용자의 잠재력을 발견하고 실질적인 행동 변화를 이끌어내는 '인생의 북극성'이 되고자 합니다.
                      </p>
                    </div>
                  </div>
                )}

                {activeModal === 'archive' && (
                  <div className="space-y-4">
                    {archive.length === 0 ? (
                      <div className="py-20 text-center text-slate-500">
                        <i className="fa-solid fa-box-open text-4xl mb-4 opacity-20"></i>
                        <p>아직 저장된 분석 리포트가 없습니다.</p>
                      </div>
                    ) : (
                      archive.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setResult(item);
                            closeModal();
                            window.scrollTo({top: document.body.scrollHeight, behavior: 'smooth'});
                          }}
                          className="w-full p-5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-blue-500/50 rounded-2xl text-left transition-all group"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">{item.user_mode}</span>
                            <span className="text-[10px] text-slate-500">{item.timestamp}</span>
                          </div>
                          <h4 className="text-white font-bold group-hover:text-blue-300 transition-colors">{item.input_analysis.vision_summary}</h4>
                          <div className="mt-2 flex items-center space-x-2">
                            <div className="h-1 flex-1 bg-slate-700 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500" style={{width: `${item.gap_report.similarity_score}%`}}></div>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400">{item.gap_report.similarity_score}% Match</span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-20 py-12 border-t border-slate-900 text-center text-slate-600 text-sm">
        <p>© 2025 North Star Universe. All paths lead to growth.</p>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}</style>
    </div>
  );
};

export default App;

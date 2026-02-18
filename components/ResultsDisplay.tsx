
import React, { useState, useMemo } from 'react';
import { AnalysisResponse, UserMode, RoadmapStep, TargetRequirement, MissingElement } from '../types';
import { 
  RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis,
  Radar, RadarChart, PolarGrid, PolarAngleAxis as RadarAngleAxis, PolarRadiusAxis, Legend, Tooltip
} from 'recharts';
import { MODE_CONFIG } from '../constants';

interface ResultsDisplayProps {
  data: AnalysisResponse;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ data }) => {
  const mode = data.user_mode as UserMode;
  const config = MODE_CONFIG[mode] || MODE_CONFIG[UserMode.PRO_NAVIGATOR];
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const [activeRadarSubject, setActiveRadarSubject] = useState<string | null>(null);
  const [activeGapTooltip, setActiveGapTooltip] = useState<string | null>(null);
  
  const [fulfilledElements, setFulfilledElements] = useState<Set<string>>(new Set());

  const toggleElement = (elItem: string) => {
    const newSet = new Set(fulfilledElements);
    if (newSet.has(elItem)) {
      newSet.delete(elItem);
    } else {
      newSet.add(elItem);
    }
    setFulfilledElements(newSet);
  };

  const { dynamicRadarData, dynamicSimilarityScore } = useMemo(() => {
    const totalMissing = data.gap_report.missing_elements.length;
    const fulfilledCount = fulfilledElements.size;
    const progressRatio = totalMissing > 0 ? fulfilledCount / totalMissing : 0;

    // 항상 5개 요소를 보장하여 오각형 유지
    const radar = data.gap_report.attributes.slice(0, 5).map(attr => {
      const gap = attr.target - attr.current;
      const boostedCurrent = attr.current + (gap * progressRatio);
      
      return {
        subject: attr.subject,
        A: Math.round(boostedCurrent),
        B: attr.target,
        fullMark: 100,
      };
    });

    const initialScore = data.gap_report.similarity_score;
    const boostedScore = Math.min(100, Math.round(initialScore + (100 - initialScore) * progressRatio));

    return { 
      dynamicRadarData: radar, 
      dynamicSimilarityScore: boostedScore 
    };
  }, [data, fulfilledElements]);

  const similarityChartData = [
    { name: 'Similarity', value: dynamicSimilarityScore, fill: '#3b82f6' }
  ];

  const getGuideIcon = (index: number) => {
    const icons = {
      [UserMode.DREAM_SEED]: ['fa-palette', 'fa-puzzle-piece', 'fa-book-open', 'fa-masks-theater', 'fa-icons'],
      [UserMode.CAREER_BUILDER]: ['fa-code', 'fa-graduation-cap', 'fa-briefcase', 'fa-microchip', 'fa-vial'],
      [UserMode.PRO_NAVIGATOR]: ['fa-chart-pie', 'fa-handshake', 'fa-chess-knight', 'fa-file-invoice-dollar', 'fa-city']
    };
    const modeIcons = icons[mode] || icons[UserMode.PRO_NAVIGATOR];
    return modeIcons[index % modeIcons.length];
  };

  const getRequirementIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('비용') || cat.includes('학비') || cat.includes('돈') || cat.includes('예산')) return 'fa-money-bill-transfer';
    if (cat.includes('시간') || cat.includes('기간')) return 'fa-clock';
    if (cat.includes('자격') || cat.includes('조건')) return 'fa-certificate';
    if (cat.includes('도구') || cat.includes('장비')) return 'fa-toolbox';
    return 'fa-tags';
  };

  const getStepIcon = (type: string) => {
    const map: Record<string, string> = {
      'base': 'fa-stairs',
      'skill': 'fa-microchip',
      'target': 'fa-crown',
      'growth': 'fa-seedling',
      'action': 'fa-fire'
    };
    return map[type.toLowerCase()] || 'fa-circle-dot';
  };

  const CustomRadarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950/95 border border-slate-800 p-4 rounded-2xl shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-200 z-50">
          <p className="text-sm font-black text-white mb-2 border-b border-slate-800 pb-1">{label}</p>
          <div className="space-y-1">
            <p className="text-xs flex justify-between space-x-6">
              <span className="text-blue-400 font-bold">시뮬레이션:</span>
              <span className="text-white font-black">{payload[0].value}점</span>
            </p>
            <p className="text-xs flex justify-between space-x-6">
              <span className="text-purple-400 font-bold">목표 기준:</span>
              <span className="text-white font-black">{payload[1].value}점</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mt-16 space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
      
      {/* 1. 페르소나 메시지 */}
      <div className="relative p-10 rounded-[2.5rem] bg-slate-900/60 border border-slate-800 overflow-hidden shadow-2xl">
        <div className={`absolute top-0 left-0 w-2 h-full bg-gradient-to-b ${config.color}`}></div>
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
          <div className={`flex-shrink-0 w-20 h-20 rounded-3xl bg-gradient-to-br ${config.color} flex items-center justify-center text-4xl shadow-2xl shadow-blue-500/20 transform -rotate-3`}>
            {config.icon}
          </div>
          <div className="space-y-4 flex-1 text-center md:text-left">
            <h4 className="text-slate-400 font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center md:justify-start space-x-3">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
              <span>북극성 시스템 분석 결과</span>
            </h4>
            <p className="text-2xl md:text-3xl font-black leading-tight text-white tracking-tighter">
              "{data.persona_message}"
            </p>
          </div>
        </div>
      </div>

      {/* 2. 실행 로드맵 */}
      <div className="bg-slate-900/40 border border-slate-800 p-8 md:p-12 rounded-[2.5rem] relative overflow-hidden shadow-inner">
        <div className="flex flex-col md:flex-row justify-between items-center mb-16 space-y-4 md:space-y-0">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Growth Strategy</span>
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase">맞춤형 실행 로드맵</h2>
            <p className="text-xs text-slate-500 font-medium">로드맵 단계를 확인하여 상세 실행 가이드를 확인하세요.</p>
          </div>
          <div className="flex space-x-4 bg-slate-950/50 p-3 rounded-2xl border border-slate-800">
             <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 uppercase">
               <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
               <span>완료</span>
             </div>
             <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 uppercase">
               <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
               <span>진행 중</span>
             </div>
          </div>
        </div>

        <div className="relative px-4 py-20">
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-0 w-full h-[3px] bg-slate-800 -translate-y-1/2 hidden md:block rounded-full overflow-hidden">
             <div 
               className="h-full bg-gradient-to-r from-emerald-500 via-blue-500 to-slate-800 transition-all duration-1000 ease-out" 
               style={{ width: `${(fulfilledElements.size / (data.gap_report.missing_elements.length || 1)) * 100}%` }}
             ></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
            {data.solution_card.roadmap?.map((step, idx) => {
              const isActive = step.status === 'current';
              const isCompleted = step.status === 'completed';
              const isUpcoming = step.status === 'upcoming';
              const isStepHovered = hoveredStep === idx;
              
              return (
                <div 
                  key={idx} 
                  className="relative flex flex-col items-center group" 
                  onMouseEnter={() => setHoveredStep(idx)} 
                  onMouseLeave={() => setHoveredStep(null)}
                >
                  {/* Detailed Description Tooltip - Positioned ABOVE the icon */}
                  <div className={`
                    absolute bottom-full mb-8 left-1/2 -translate-x-1/2 w-80 p-6 
                    bg-slate-950/98 border-2 border-slate-800 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] 
                    z-[100] backdrop-blur-2xl transition-all duration-300 pointer-events-none transform
                    ${isStepHovered ? 'opacity-100 translate-y-0 scale-100 visible' : 'opacity-0 translate-y-4 scale-95 invisible'}
                  `}>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-4 bg-slate-950 border-b-2 border-r-2 border-slate-800 rotate-45"></div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-blue-500 animate-pulse' : isCompleted ? 'bg-emerald-500' : 'bg-slate-500'}`}></div>
                          <h4 className="text-[11px] font-black text-blue-500 uppercase tracking-[0.2em]">Step {idx + 1} 가이드</h4>
                        </div>
                        <i className={`fa-solid ${getStepIcon(step.icon_type)} text-slate-700 text-xs`}></i>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-black text-white tracking-tight">{step.title}</p>
                        <p className="text-xs text-slate-300 leading-relaxed font-medium">
                          {step.detail}
                        </p>
                      </div>
                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                         <span className="text-[9px] font-bold text-slate-500 uppercase">Roadmap Insight</span>
                         <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-blue-400' : isCompleted ? 'text-emerald-400' : 'text-slate-600'}`}>{step.status}</span>
                      </div>
                    </div>
                  </div>

                  {/* Icon Circle */}
                  <div className={`
                    w-24 h-24 rounded-[2rem] flex items-center justify-center text-3xl 
                    transition-all duration-500 cursor-help relative transform 
                    ${isCompleted ? 'bg-emerald-600 border-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]' : ''} 
                    ${isActive ? 'bg-blue-600 border-white text-white shadow-[0_0_40px_rgba(59,130,246,0.6)] scale-110 z-20' : ''} 
                    ${isUpcoming ? 'bg-slate-800 border-slate-700 text-slate-600 grayscale' : ''} 
                    border-[3px] group-hover:-translate-y-2 group-hover:shadow-2xl
                  `}>
                    <i className={`fa-solid ${getStepIcon(step.icon_type)}`}></i>
                    {isCompleted && <div className="absolute -top-2 -right-2 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center border-4 border-slate-900 shadow-lg"><i className="fa-solid fa-check text-[10px] text-white"></i></div>}
                    {isActive && <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center border-4 border-slate-900 shadow-lg"><i className="fa-solid fa-location-dot text-[10px] text-blue-600 animate-bounce"></i></div>}
                  </div>

                  {/* Text Description below the line */}
                  <div className="mt-8 text-center space-y-3 max-w-[220px]">
                    <div className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${isActive ? 'bg-blue-500 text-white' : isCompleted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>Step {idx + 1}</div>
                    <h3 className={`text-sm font-black uppercase tracking-tighter transition-colors ${isActive ? 'text-white' : isCompleted ? 'text-emerald-400' : 'text-slate-500'}`}>{step.title}</h3>
                    <p className="text-xs text-slate-400 font-bold leading-relaxed opacity-80">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. 격차 분석 및 오각형 차트 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 bg-slate-900/60 border border-slate-800 p-8 rounded-[2.5rem] flex flex-col justify-between shadow-lg relative">
          <div className="space-y-6">
            <div className="space-y-1">
              <h4 className="text-xs font-black text-red-400 uppercase tracking-widest flex items-center space-x-2">
                <i className="fa-solid fa-puzzle-piece animate-pulse"></i>
                <span>성장 시뮬레이션 (Gap-Fill)</span>
              </h4>
              <p className="text-[10px] text-slate-500 uppercase font-black">항목을 클릭하여 충족 상태를 시뮬레이션 하세요.</p>
            </div>
            <div className="space-y-3 relative">
              {data.gap_report.missing_elements.map((el, idx) => {
                const isFulfilled = fulfilledElements.has(el.item);
                const isTooltipActive = activeGapTooltip === el.item;
                
                return (
                  <div key={idx} className="relative group/gap">
                    <button 
                      onClick={() => {
                        toggleElement(el.item);
                        setActiveGapTooltip(activeGapTooltip === el.item ? null : el.item);
                      }} 
                      onMouseEnter={() => setActiveGapTooltip(el.item)}
                      onMouseLeave={() => setActiveGapTooltip(null)}
                      className={`w-full flex items-center justify-between p-4 border transition-all duration-300 rounded-2xl group text-left ${isFulfilled ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-slate-900/50 border-slate-800 hover:border-slate-600'}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isFulfilled ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500'}`}><i className={`fa-solid ${isFulfilled ? 'fa-check' : 'fa-lock'} text-xs`}></i></div>
                        <span className={`text-sm font-bold transition-colors ${isFulfilled ? 'text-emerald-400' : 'text-slate-300'}`}>{el.item}</span>
                      </div>
                      <i className="fa-solid fa-circle-info text-slate-700 group-hover:text-blue-500/50 text-[10px] transition-colors"></i>
                    </button>

                    <div className={`
                      absolute left-full ml-4 top-1/2 -translate-y-1/2 w-64 p-4 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl z-[60] backdrop-blur-xl
                      transition-all duration-300 pointer-events-none transform
                      ${isTooltipActive ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 -translate-x-4 scale-95'}
                      hidden lg:block
                    `}>
                      <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-slate-950 border-b border-l border-slate-800 rotate-45"></div>
                      <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">핵심 기여도 (Why)</p>
                      <p className="text-xs text-slate-300 leading-relaxed font-medium">{el.impact}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="pt-8 mt-8 border-t border-slate-800">
             <div className="flex justify-between items-center mb-3"><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">목표 근접도</span><span className="text-xs font-black text-emerald-500">{Math.round((fulfilledElements.size / (data.gap_report.missing_elements.length || 1)) * 100)}%</span></div>
             <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-emerald-600 to-blue-600 transition-all duration-700 ease-out" style={{ width: `${(fulfilledElements.size / (data.gap_report.missing_elements.length || 1)) * 100}%` }}></div></div>
          </div>
        </div>

        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 오각형 레이더 차트 */}
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] flex flex-col relative overflow-hidden">
            <h3 className="text-slate-500 uppercase tracking-[0.2em] text-[10px] font-black mb-10 flex items-center space-x-2"><i className="fa-solid fa-chart-simple text-blue-500"></i><span>역량 오각형 분석</span></h3>
            <div className="flex-1 min-h-[300px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart 
                  cx="50%" cy="50%" outerRadius="75%" data={dynamicRadarData}
                  onMouseMove={(state) => { if (state && state.activeLabel) setActiveRadarSubject(state.activeLabel); }}
                  onMouseLeave={() => setActiveRadarSubject(null)}
                >
                  <PolarGrid gridType="polygon" stroke="#1e293b" strokeWidth={1} />
                  <RadarAngleAxis 
                    dataKey="subject" 
                    tick={(props) => {
                      const isActive = props.payload.value === activeRadarSubject;
                      return (
                        <text
                          x={props.x} y={props.y} textAnchor={props.textAnchor}
                          fill={isActive ? "#3b82f6" : "#64748b"}
                          fontSize={isActive ? 12 : 10} fontWeight={isActive ? 900 : 700}
                          className="transition-all duration-300"
                        >
                          {props.payload.value}
                        </text>
                      );
                    }} 
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="목표" dataKey="B" stroke="#a855f7" fill="#a855f7" fillOpacity={0.05} strokeWidth={2} strokeDasharray="5 5" isAnimationActive={false} />
                  <Radar 
                    name="현재" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} strokeWidth={3}
                    dot={(props) => {
                      const isActive = props.payload.subject === activeRadarSubject;
                      return <circle cx={props.cx} cy={props.cy} r={isActive ? 6 : 4} fill="#3b82f6" stroke="#fff" strokeWidth={isActive ? 2 : 1} className="transition-all duration-300" />;
                    }}
                    isAnimationActive={true} animationDuration={800} animationEasing="ease-out"
                  />
                  <Tooltip content={<CustomRadarTooltip />} cursor={false} />
                  <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '11px', fontWeight: 800 }} verticalAlign="bottom" />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] flex flex-col items-center justify-center relative overflow-hidden">
            <h3 className="text-slate-500 uppercase tracking-[0.2em] text-[10px] font-black mb-10 self-start flex items-center space-x-2"><i className="fa-solid fa-bullseye text-purple-500"></i><span>목표 도달 확률</span></h3>
            <div className="relative w-64 h-64">
               <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart innerRadius="80%" outerRadius="100%" data={similarityChartData} startAngle={90} endAngle={450}>
                  <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                  <RadialBar background dataKey="value" cornerRadius={30} fill="#3b82f6" isAnimationActive={true} animationDuration={1000} animationEasing="ease-out" />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-5xl font-black text-white tracking-tighter transition-all duration-500">{dynamicSimilarityScore}%</span><span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-2">Similarity Score</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. 대시보드 박스: 추가 정보 및 목표 달성 리소스 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900/60 border border-slate-800 p-8 md:p-10 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
          <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${config.color} opacity-5 blur-[100px]`}></div>
          <div className="relative z-10 space-y-8">
            <div className="space-y-2">
              <h3 className={`uppercase tracking-[0.2em] text-[10px] font-black flex items-center space-x-2 bg-clip-text text-transparent bg-gradient-to-r ${config.color}`}>
                <i className="fa-solid fa-keyboard"></i>
                <span>정밀도 향상 가이드</span>
              </h3>
              <h2 className="text-2xl font-black text-white tracking-tighter">분석 고도화를 위한 추가 정보</h2>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {data.required_info_guide.map((info, idx) => (
                <div key={idx} className="flex items-center space-x-5 p-4 bg-slate-800/20 border border-slate-700/40 rounded-3xl group cursor-default">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-2xl bg-gradient-to-br ${config.color} opacity-80 flex items-center justify-center text-white shadow-lg`}>
                    <i className={`fa-solid ${getGuideIcon(idx)} text-sm`}></i>
                  </div>
                  <div className="flex-1 text-slate-200 text-xs font-black">{info}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-8 md:p-10 rounded-[2.5rem] relative overflow-hidden shadow-2xl border-l-blue-500/30">
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500 opacity-5 blur-[100px]"></div>
          <div className="relative z-10 space-y-8">
            <div className="space-y-2">
              <h3 className="uppercase tracking-[0.2em] text-[10px] font-black flex items-center space-x-2 text-emerald-400">
                <i className="fa-solid fa-sack-dollar"></i>
                <span>목표 달성 리소스 맵</span>
              </h3>
              <h2 className="text-2xl font-black text-white tracking-tighter">필요 조건 및 예상 리소스</h2>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {data.target_requirements?.map((req, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-slate-950/40 border border-slate-800/60 rounded-3xl group">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                       <i className={`fa-solid ${getRequirementIcon(req.category)}`}></i>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">{req.category}</p>
                      <h4 className="text-xs font-bold text-slate-200">{req.item}</h4>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-emerald-400">{req.cost_or_condition}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. 벡터 맵 요약 */}
      <div className="bg-slate-900/40 border border-slate-800 p-10 rounded-[2.5rem] shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-center">
          <div className="text-center md:text-left space-y-2">
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Origin Vector (현재)</span>
             <p className="text-xl font-black text-white tracking-tight">{data.input_analysis.current_vector}</p>
          </div>
          <div className="flex flex-col items-center justify-center py-4">
            <div className={`w-14 h-14 rounded-full bg-gradient-to-r ${config.color} flex items-center justify-center shadow-xl animate-bounce border-4 border-slate-900`}>
               <i className="fa-solid fa-arrow-right text-white text-xl"></i>
            </div>
            <span className="mt-4 text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Mapping Success</span>
          </div>
          <div className="text-center md:text-right space-y-2">
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Target Vector (목표)</span>
             <p className="text-xl font-black text-white tracking-tight">{data.input_analysis.target_vector}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;

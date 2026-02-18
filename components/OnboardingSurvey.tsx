
import React, { useState } from 'react';
import { SurveyData, UserMode } from '../types';

interface OnboardingSurveyProps {
  onComplete: (data: SurveyData) => void;
}

const OnboardingSurvey: React.FC<OnboardingSurveyProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<SurveyData>({
    name: '',
    ageGroup: 'Career Builder',
    field: '',
    budgetLevel: 'mid',
    availableTime: 'mid',
    ultimateGoal: ''
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(formData);
  };

  const progress = (step / 4) * 100;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-2xl text-slate-200">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        
        <div className="h-1.5 w-full bg-slate-800">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
          <div className="space-y-2 text-center">
            <div className="inline-block px-3 py-1 bg-blue-500/10 rounded-full text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">
              은하계 입성 설문 {step}/4
            </div>
            <h2 className="text-3xl font-black text-white tracking-tighter">
              {step === 1 && "당신을 뭐라고 부를까요?"}
              {step === 2 && "현재 어떤 단계에 계신가요?"}
              {step === 3 && "활용 가능한 자원은 어느 정도인가요?"}
              {step === 4 && "당신의 최종적인 북극성은 무엇인가요?"}
            </h2>
          </div>

          <div className="min-h-[220px] flex items-center">
            {step === 1 && (
              <div className="w-full space-y-4">
                <input
                  autoFocus
                  type="text"
                  placeholder="이름 또는 닉네임"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-xl text-white focus:border-blue-500 outline-none transition-all"
                />
                <p className="text-xs text-slate-600 text-center">분석 리포트의 수신인 명칭으로 사용됩니다.</p>
              </div>
            )}

            {step === 2 && (
              <div className="w-full grid grid-cols-1 gap-3">
                {[
                  { id: 'Dream Seed', icon: 'fa-rocket', label: '성장하는 아이 (3~13세)' },
                  { id: 'Career Builder', icon: 'fa-bolt', label: '도전하는 청년 (19~29세)' },
                  { id: 'Pro Navigator', icon: 'fa-compass', label: '도약하는 전문가 (30세 이상)' }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFormData({...formData, ageGroup: item.id})}
                    className={`flex items-center space-x-4 p-5 rounded-2xl border transition-all ${
                      formData.ageGroup === item.id 
                      ? 'bg-blue-500/10 border-blue-500 text-white shadow-lg' 
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <i className={`fa-solid ${item.icon} text-xl`}></i>
                    <span className="font-bold">{item.label}</span>
                  </button>
                ))}
              </div>
            )}

            {step === 3 && (
              <div className="w-full space-y-8">
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">준비된 예산 수준</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['low', 'mid', 'high'].map(lv => (
                      <button
                        key={lv}
                        type="button"
                        onClick={() => setFormData({...formData, budgetLevel: lv})}
                        className={`py-3 rounded-xl border text-xs font-black transition-all ${
                          formData.budgetLevel === lv ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-600'
                        }`}
                      >
                        {lv === 'low' ? '알뜰형' : lv === 'mid' ? '보통' : '충분'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">투입 가능한 시간</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['low', 'mid', 'high'].map(lv => (
                      <button
                        key={lv}
                        type="button"
                        onClick={() => setFormData({...formData, availableTime: lv})}
                        className={`py-3 rounded-xl border text-xs font-black transition-all ${
                          formData.availableTime === lv ? 'bg-blue-500 border-blue-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-600'
                        }`}
                      >
                        {lv === 'low' ? '틈틈이' : lv === 'mid' ? '하루 2~3시간' : '전념'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="w-full space-y-4">
                <textarea
                  autoFocus
                  placeholder="예: 5년 뒤 실리콘밸리 시니어 개발자, 나만의 브랜드를 런칭한 디자이너 등"
                  value={formData.ultimateGoal}
                  onChange={e => setFormData({...formData, ultimateGoal: e.target.value})}
                  className="w-full h-32 bg-slate-950 border border-slate-800 rounded-2xl p-5 text-lg text-white focus:border-blue-500 outline-none transition-all resize-none"
                />
                <input
                  type="text"
                  placeholder="주요 관심 분야 (예: IT, 패션, 교육, 요리)"
                  value={formData.field}
                  onChange={e => setFormData({...formData, field: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white focus:border-blue-500 outline-none transition-all"
                />
              </div>
            )}
          </div>

          <div className="flex space-x-4 pt-4">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="flex-1 py-4 rounded-2xl bg-slate-800 text-slate-400 font-bold hover:bg-slate-700 transition-colors"
              >
                이전
              </button>
            )}
            {step < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={step === 1 && !formData.name}
                className="flex-[2] py-4 rounded-2xl bg-white text-slate-950 font-bold hover:bg-blue-50 transition-colors disabled:opacity-50"
              >
                다음 단계로
              </button>
            ) : (
              <button
                type="submit"
                className="flex-[2] py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                은하계 시스템 시작
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default OnboardingSurvey;

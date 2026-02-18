
import React, { useState } from 'react';

interface SubscriptionModalProps {
  onClose: () => void;
  onSubscribe: () => void;
  isPro: boolean;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ onClose, onSubscribe, isPro }) => {
  const [step, setStep] = useState<'plan' | 'payment' | 'success'>('plan');
  const [loading, setLoading] = useState(false);

  const handlePayment = () => {
    setLoading(true);
    // Simulate payment processing
    setTimeout(() => {
      setLoading(false);
      setStep('success');
      onSubscribe();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        
        <div className="p-8 md:p-12">
          {step === 'plan' && (
            <div className="space-y-10">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-black text-white tracking-tighter">초월적인 성장을 위한 한 걸음</h2>
                <p className="text-slate-400 text-sm">North Star PRO와 함께 당신의 벡터를 무한히 확장하세요.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Free Plan */}
                <div className="p-8 rounded-3xl bg-slate-800/30 border border-slate-700 space-y-6 opacity-60">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white">Standard</h3>
                    <p className="text-2xl font-black text-white">₩0 <span className="text-xs text-slate-500">/ forever</span></p>
                  </div>
                  <ul className="space-y-3 text-xs text-slate-400 font-medium">
                    <li className="flex items-center space-x-2"><i className="fa-solid fa-check text-blue-500"></i><span>기본 격차 분석</span></li>
                    <li className="flex items-center space-x-2"><i className="fa-solid fa-check text-blue-500"></i><span>기초 로드맵 생성</span></li>
                    <li className="flex items-center space-x-2"><i className="fa-solid fa-xmark text-red-500"></i><span>PRO 전용 컨설팅 엔진</span></li>
                  </ul>
                  <button disabled className="w-full py-3 rounded-xl bg-slate-700 text-slate-500 text-xs font-black uppercase">현재 이용 중</button>
                </div>

                {/* PRO Plan */}
                <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-amber-500/50 space-y-6 relative shadow-2xl shadow-amber-500/10 scale-105">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-500 rounded-full text-[9px] font-black text-slate-950 uppercase tracking-widest">Recommended</div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-amber-400 flex items-center space-x-2">
                      <i className="fa-solid fa-crown"></i>
                      <span>PRO PASS</span>
                    </h3>
                    <p className="text-2xl font-black text-white">₩9,900 <span className="text-xs text-slate-500">/ month</span></p>
                  </div>
                  <ul className="space-y-3 text-xs text-slate-300 font-bold">
                    <li className="flex items-center space-x-2"><i className="fa-solid fa-bolt text-amber-500"></i><span>무제한 고정밀 벡터 분석</span></li>
                    <li className="flex items-center space-x-2"><i className="fa-solid fa-bolt text-amber-500"></i><span>PRO 전용 시뮬레이션 엔진</span></li>
                    <li className="flex items-center space-x-2"><i className="fa-solid fa-bolt text-amber-500"></i><span>상세 리소스 비용 실시간 맵핑</span></li>
                    <li className="flex items-center space-x-2"><i className="fa-solid fa-bolt text-amber-500"></i><span>프리미엄 PDF 리포트 추출</span></li>
                  </ul>
                  <button 
                    onClick={() => setStep('payment')}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-600 text-slate-950 text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform"
                  >
                    지금 시작하기
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 'payment' && (
            <div className="space-y-10 py-4">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-black text-white">결제 정보 입력</h2>
                <p className="text-slate-500 text-sm">안전한 은하계 결제 시스템을 이용합니다.</p>
              </div>

              <div className="space-y-6 max-w-sm mx-auto">
                <div className="space-y-4">
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">카드 번호</label>
                    <input type="text" placeholder="**** **** **** ****" className="bg-transparent text-white w-full outline-none font-mono" defaultValue="4242 4242 4242 4242" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">만료일</label>
                      <input type="text" placeholder="MM/YY" className="bg-transparent text-white w-full outline-none font-mono" defaultValue="12/28" />
                    </div>
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                      <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">CVC</label>
                      <input type="text" placeholder="***" className="bg-transparent text-white w-full outline-none font-mono" defaultValue="999" />
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handlePayment}
                  disabled={loading}
                  className="w-full py-5 rounded-2xl bg-white text-slate-950 font-black uppercase tracking-[0.2em] flex items-center justify-center space-x-3 hover:bg-amber-400 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <i className="fa-solid fa-circle-notch fa-spin"></i>
                      <span>결제 처리 중...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-lock"></i>
                      <span>₩9,900 결제하기</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center space-y-10 py-10 animate-in fade-in zoom-in duration-500">
              <div className="w-24 h-24 bg-gradient-to-tr from-amber-400 to-yellow-600 rounded-full flex items-center justify-center text-5xl text-slate-950 mx-auto shadow-2xl shadow-amber-500/30">
                <i className="fa-solid fa-crown"></i>
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-black text-white">PRO 멤버십 가입 완료!</h2>
                <p className="text-slate-400 max-w-xs mx-auto text-sm leading-relaxed">
                  이제 모든 프리미엄 기능을 무제한으로 이용하실 수 있습니다. 당신의 북극성이 더욱 밝게 빛납니다.
                </p>
              </div>
              <button 
                onClick={onClose}
                className="px-10 py-4 rounded-full bg-slate-800 text-white font-black uppercase tracking-widest hover:bg-slate-700 transition-colors"
              >
                대시보드로 돌아가기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;

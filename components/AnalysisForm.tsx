
import React, { useState, useRef } from 'react';
import { UserMode } from '../types';

interface AnalysisFormProps {
  onAnalyze: (text: string, image: string | null) => void;
  isLoading: boolean;
  activeMode: UserMode | null;
}

const AnalysisForm: React.FC<AnalysisFormProps> = ({ onAnalyze, isLoading, activeMode }) => {
  const [text, setText] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;
    onAnalyze(text, imagePreview);
  };

  const clearImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const placeholderText = activeMode === UserMode.DREAM_SEED 
    ? "아이가 좋아하는 것이나 최근 그린 그림에 대해 들려주세요!"
    : activeMode === UserMode.CAREER_BUILDER
    ? "현재 전공, 보유 스펙, 그리고 목표하는 기업이나 직무를 입력하세요."
    : "현재 경력 상황과 다음 단계(이직, 승진, 창업 등)에 대한 고민을 입력하세요.";

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      <div className="relative group">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholderText}
          className="w-full h-40 bg-slate-900/80 border border-slate-700 rounded-2xl p-6 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none"
        />
        <div className="absolute bottom-4 right-4 flex space-x-3">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3 bg-slate-800 text-slate-400 rounded-xl hover:text-white hover:bg-slate-700 transition-colors"
            title="이미지 업로드 (그림, 성적표, 이력서 등)"
          >
            <i className="fa-solid fa-camera"></i>
          </button>
        </div>
      </div>

      {imagePreview && (
        <div className="relative inline-block group">
          <img
            src={imagePreview}
            alt="Preview"
            className="h-32 w-auto rounded-xl border border-slate-700 shadow-xl"
          />
          <button
            type="button"
            onClick={clearImage}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || (!text.trim() && !imagePreview)}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center space-x-2 ${
          isLoading 
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-blue-500/20 active:scale-[0.98]'
        }`}
      >
        {isLoading ? (
          <>
            <i className="fa-solid fa-circle-notch fa-spin"></i>
            <span>은하계 엔진 분석 중...</span>
          </>
        ) : (
          <>
            <i className="fa-solid fa-wand-magic-sparkles"></i>
            <span>벡터 맵핑 시작</span>
          </>
        )}
      </button>
    </form>
  );
};

export default AnalysisForm;

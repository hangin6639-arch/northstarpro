
import React from 'react';
import { UserMode } from './types';

export const MODE_CONFIG = {
  [UserMode.DREAM_SEED]: {
    label: 'Dream Seed',
    target: '3~13세',
    description: '아이들의 무한한 상상력을 현실의 꿈으로 연결합니다.',
    icon: <i className="fa-solid fa-rocket text-yellow-400"></i>,
    color: 'from-blue-400 to-purple-500',
    tone: 'Iron Man / 유치원 선생님'
  },
  [UserMode.CAREER_BUILDER]: {
    label: 'Career Builder',
    target: '19~29세',
    description: '냉철한 데이터 분석으로 실무 역량의 간극을 메웁니다.',
    icon: <i className="fa-solid fa-bolt text-cyan-400"></i>,
    color: 'from-cyan-500 to-blue-700',
    tone: 'Steve Jobs / 냉철한 조언가'
  },
  [UserMode.PRO_NAVIGATOR]: {
    label: 'Pro Navigator',
    target: '30세 이상',
    description: '전략적 통찰력으로 제2의 정점을 향한 길을 제시합니다.',
    icon: <i className="fa-solid fa-compass text-emerald-400"></i>,
    color: 'from-emerald-500 to-teal-700',
    tone: 'McKinsey Consultant / 전략가'
  }
};

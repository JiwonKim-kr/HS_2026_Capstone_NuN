/**
 * Prompt-U 개인정보 처리방침
 * Privacy Policy for Prompt-U
 *
 * 실제 수집·처리 항목을 기반으로 작성되었습니다.
 * Based on actual data collected and processed by the service.
 */

export type PolicyParagraph =
  | { type: 'text'; text: string }
  | { type: 'list'; items: string[] };

export type PolicySection = {
  title: string;
  content: PolicyParagraph[];
};

export type PrivacyPolicyDoc = {
  title: string;
  effectiveDate: string;
  intro: string;
  sections: PolicySection[];
};

export const privacyPolicy: Record<'ko' | 'en', PrivacyPolicyDoc> = {
  ko: {
    title: '개인정보 처리방침',
    effectiveDate: '시행일: 2026년 5월 27일',
    intro:
      'Prompt-U(이하 "서비스")는 이용자의 개인정보를 소중히 여기며, 「개인정보 보호법」 및 관련 법령을 철저히 준수합니다. 본 방침은 서비스가 수집하는 개인정보의 항목, 이용 목적, 보유 기간, 제3자 위탁 현황 및 이용자의 권리를 안내합니다.',
    sections: [
      {
        title: '제1조 (수집하는 개인정보 항목 및 수집 방법)',
        content: [
          {
            type: 'text',
            text: '서비스는 아래 항목의 개인정보를 수집합니다.',
          },
          {
            type: 'list',
            items: [
              '[필수] 이메일 주소, 비밀번호(암호화 저장), 전화번호 — 회원가입 시',
              '[소셜] Google 계정 이메일 — Google 소셜 로그인 이용 시',
              '[선택] 연령, 성별, 직업군, 주요 활용 목적, 답변 스타일 선호도 — 온보딩 및 프로필 설정 시',
              '[자동] 프롬프트 입력 초안, 프롬프트 후보 선택 및 피드백, 스타일 가중치 데이터 — 서비스 이용 중 자동 수집',
              '[자동] 서비스 이용 로그(세션 ID, 생성 일시) — 서비스 이용 중 자동 수집',
              '[선택] MCP API 키(SHA-256 해시로 저장, 원문 키는 최초 발급 시에만 표시) — 설정 메뉴 이용 시',
            ],
          },
        ],
      },
      {
        title: '제2조 (개인정보 수집 및 이용 목적)',
        content: [
          {
            type: 'list',
            items: [
              '회원 가입 및 본인 확인, 서비스 이용 계약 이행',
              '사용자 맞춤형 AI 프롬프트 최적화 서비스 제공',
              '사용자 스타일 프로필 학습 및 가중치(어투·수준·밀도·창의성) 개인화',
              '서비스 이용 이력 관리 및 고객 지원',
              '프롬프트 최적화 AI 모델 성능 개선 및 학습 (제3조 참조)',
              '서비스 품질 향상 및 신규 기능 개발',
              'MCP 외부 연동 API 키 발급 및 인증',
            ],
          },
        ],
      },
      {
        title: '제3조 (AI 학습 데이터 활용)',
        content: [
          {
            type: 'text',
            text: '서비스는 프롬프트 최적화 AI 모델의 품질 향상을 위해 아래와 같이 이용자의 데이터를 학습에 활용할 수 있습니다.',
          },
          {
            type: 'list',
            items: [
              '활용 데이터: 사용자 입력 초안(프롬프트), AI가 생성한 프롬프트 후보, 이용자의 피드백(선택·좋아요 등), 스타일 가중치 데이터',
              '활용 목적: Prompt-U 프롬프트 최적화 모델의 성능 개선 및 개인화 정확도 향상',
              '활용 방식: 서비스 내부 모델 개선 목적으로만 사용되며, 제3자에게 학습 데이터로 제공하지 않습니다',
              '거부 권리: 이용자는 학습 데이터 활용에 동의하지 않을 권리가 있으며, 거부 시 일부 개인화 기능이 제한될 수 있습니다. 거부 요청은 개인정보 보호책임자(teamnun02@gmail.com)에게 이메일로 신청하실 수 있습니다',
            ],
          },
        ],
      },
      {
        title: '제4조 (개인정보 보유 및 이용 기간)',
        content: [
          {
            type: 'text',
            text: '회원 탈퇴 시 또는 수집·이용 목적 달성 시 지체 없이 파기합니다. 단, 다음 법령에 따라 일정 기간 보존합니다.',
          },
          {
            type: 'list',
            items: [
              '계약 또는 청약철회에 관한 기록: 5년 (전자상거래법)',
              '소비자 불만 또는 분쟁 처리에 관한 기록: 3년 (전자상거래법)',
              '접속에 관한 기록: 3개월 (통신비밀보호법)',
            ],
          },
        ],
      },
      {
        title: '제5조 (개인정보의 제3자 제공 및 처리 위탁)',
        content: [
          {
            type: 'text',
            text: '서비스는 원활한 운영을 위해 아래 업체에 개인정보 처리를 위탁하며, 해당 업체의 서버는 대한민국 외부(미국)에 위치합니다.',
          },
          {
            type: 'list',
            items: [
              'Supabase Inc. (미국): 데이터베이스 저장 및 사용자 인증 처리',
              'Anthropic PBC (미국): AI 프롬프트 생성 처리 — 서비스 이용 시 사용자의 입력 초안 및 프로필 정보(직업군·활용 목적)가 전달됩니다',
              'Google LLC (미국): OAuth 소셜 로그인 인증',
            ],
          },
          {
            type: 'text',
            text: '위 업체들은 위탁받은 업무 범위 외의 목적으로 개인정보를 이용하지 않습니다.',
          },
        ],
      },
      {
        title: '제6조 (개인정보의 파기)',
        content: [
          {
            type: 'text',
            text: '보유 기간이 경과하거나 처리 목적이 달성된 개인정보는 지체 없이 파기합니다. 전자적 파일은 복구할 수 없는 방법으로 영구 삭제하며, 출력물 등 비전자적 기록은 분쇄 또는 소각합니다.',
          },
        ],
      },
      {
        title: '제7조 (이용자의 권리와 행사 방법)',
        content: [
          {
            type: 'text',
            text: '이용자는 아래 권리를 언제든지 행사할 수 있습니다.',
          },
          {
            type: 'list',
            items: [
              '개인정보 열람 요청',
              '오류 정정 또는 삭제 요청',
              '처리 정지 요청',
              '동의 철회 (회원 탈퇴를 통해 행사 가능)',
            ],
          },
          {
            type: 'text',
            text: '서비스 내 프로필·설정 메뉴를 통해 직접 행사하시거나, 아래 개인정보 보호책임자에게 이메일로 요청하실 수 있습니다.',
          },
        ],
      },
      {
        title: '제8조 (개인정보 보호책임자)',
        content: [
          {
            type: 'list',
            items: [
              '책임자: 팀 NuN',
              '이메일: teamnun02@gmail.com',
            ],
          },
          {
            type: 'text',
            text: '개인정보 관련 문의, 불만 접수 및 피해 구제 신청은 위 이메일로 연락해 주시면 신속히 처리해 드리겠습니다.',
          },
        ],
      },
      {
        title: '제9조 (처리방침 변경)',
        content: [
          {
            type: 'text',
            text: '본 방침은 법령·정책 변경 또는 서비스 내용 변경에 따라 개정될 수 있습니다. 변경 시에는 서비스 내 공지사항 또는 이메일을 통해 시행 7일 전에 사전 안내해 드립니다.',
          },
        ],
      },
    ],
  },

  en: {
    title: 'Privacy Policy',
    effectiveDate: 'Effective Date: May 27, 2026',
    intro:
      'Prompt-U (the "Service") values the privacy of its users and fully complies with the Personal Information Protection Act (PIPA) and related regulations. This policy explains the items of personal information we collect, our purposes, retention periods, third-party processors, and your rights as a data subject.',
    sections: [
      {
        title: 'Article 1 – Personal Information Collected and Collection Methods',
        content: [
          {
            type: 'text',
            text: 'The Service collects the following personal information.',
          },
          {
            type: 'list',
            items: [
              '[Required] Email address, password (stored encrypted), phone number — collected at sign-up',
              '[Social] Google account email — collected when using Google social login',
              '[Optional] Age, gender, job category, primary use case, response style preference — collected during onboarding and profile setup',
              '[Automatic] Prompt draft inputs, prompt candidate selection and feedback, style weight data — automatically collected during service use',
              '[Automatic] Service usage logs (session ID, timestamp) — automatically collected during service use',
              '[Optional] MCP API key (stored as SHA-256 hash; raw key shown only at initial issuance) — collected when using the settings menu',
            ],
          },
        ],
      },
      {
        title: 'Article 2 – Purposes of Collection and Use',
        content: [
          {
            type: 'list',
            items: [
              'Membership registration, identity verification, and service contract fulfillment',
              'Provision of personalized AI prompt optimization services',
              'Learning user style profiles and personalizing style weights (tone, level, density, creativity)',
              'Service usage history management and customer support',
              'Improving the prompt optimization AI model through training data (see Article 3)',
              'Service quality improvement and new feature development',
              'Issuance and authentication of MCP external integration API keys',
            ],
          },
        ],
      },
      {
        title: 'Article 3 – Use of Data for AI Training',
        content: [
          {
            type: 'text',
            text: 'The Service may use user data to improve the quality of its prompt optimization AI model as follows:',
          },
          {
            type: 'list',
            items: [
              'Data used: User prompt drafts, AI-generated prompt candidates, user feedback (selections, likes, etc.), and style weight data',
              'Purpose: Improving the performance and personalization accuracy of Prompt-U\'s prompt optimization model',
              'How it\'s used: Used solely for internal model improvement; learning data is not provided to any third party',
              'Right to opt out: Users have the right to refuse use of their data for AI training. Refusal may result in limited personalization features. Opt-out requests can be submitted to the Privacy Officer at teamnun02@gmail.com',
            ],
          },
        ],
      },
      {
        title: 'Article 4 – Retention and Use Period',
        content: [
          {
            type: 'text',
            text: 'Personal information is destroyed without delay upon account deletion or upon achievement of the collection/use purpose. However, the following records are retained in accordance with applicable law:',
          },
          {
            type: 'list',
            items: [
              'Records of contracts or subscription withdrawal: 5 years (E-Commerce Act)',
              'Records of consumer complaints or dispute resolution: 3 years (E-Commerce Act)',
              'Access logs: 3 months (Protection of Communications Secrets Act)',
            ],
          },
        ],
      },
      {
        title: 'Article 5 – Third-Party Provision and Processing Outsourcing',
        content: [
          {
            type: 'text',
            text: 'For smooth service operation, the Service entrusts personal information processing to the following vendors. Their servers are located outside Korea (United States):',
          },
          {
            type: 'list',
            items: [
              'Supabase Inc. (USA): Database storage and user authentication',
              'Anthropic PBC (USA): AI prompt generation — user prompt drafts and profile data (job/purpose) are transmitted during service use',
              'Google LLC (USA): OAuth social login authentication',
            ],
          },
          {
            type: 'text',
            text: 'These vendors do not use personal information for any purpose beyond the scope of their contracted services.',
          },
        ],
      },
      {
        title: 'Article 6 – Destruction of Personal Information',
        content: [
          {
            type: 'text',
            text: 'Personal information for which the retention period has elapsed or the purpose of processing has been achieved is destroyed without delay. Electronic files are permanently deleted by means that prevent recovery; printed materials are shredded or incinerated.',
          },
        ],
      },
      {
        title: 'Article 7 – User Rights and How to Exercise Them',
        content: [
          {
            type: 'text',
            text: 'You may exercise the following rights at any time:',
          },
          {
            type: 'list',
            items: [
              'Request access to your personal information',
              'Request correction or deletion of erroneous information',
              'Request suspension of processing',
              'Withdraw consent (exercisable by deleting your account)',
            ],
          },
          {
            type: 'text',
            text: 'Rights may be exercised directly through the Profile or Settings menu, or by contacting our Privacy Officer via the email address listed below.',
          },
        ],
      },
      {
        title: 'Article 8 – Privacy Officer',
        content: [
          {
            type: 'list',
            items: [
              'Officer: Team NuN',
              'Email: teamnun02@gmail.com',
            ],
          },
          {
            type: 'text',
            text: 'For inquiries, complaints, or requests for relief related to personal information, please contact us at the email above and we will respond promptly.',
          },
        ],
      },
      {
        title: 'Article 9 – Changes to This Policy',
        content: [
          {
            type: 'text',
            text: 'This policy may be revised in response to changes in laws, government policies, or service content. Any changes will be communicated at least 7 days in advance via in-service notices or email.',
          },
        ],
      },
    ],
  },
};

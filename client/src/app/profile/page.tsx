"use client";

import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Sparkles, User as UserIcon } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { supabase } from "@/lib/supabase/client";

interface UserProfile {
  age_group: string;
  gender: string;
  job_role: string;
  primary_purpose: string;
  preferred_style: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editProfile, setEditProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      if (!user) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        const userProfile = {
          age_group: data.age_group || "",
          gender: data.gender || "",
          job_role: data.job_role || "",
          primary_purpose: data.primary_purpose || "",
          preferred_style: data.preferred_style || "",
        };
        setProfile(userProfile);
        setEditProfile(userProfile);
      }
      setLoading(false);
    }

    fetchProfile();
  }, [user]);

  const userWeights = [
    { label: "답변 어투", value: 80 },
    { label: "답변 수준 (전문성 + 어휘 수준)", value: 90 },
    { label: "정보 밀도 및 구체성", value: 30 },
    { label: "창의성 및 허용도", value: 70 },
  ];

  const handleSave = async () => {
    if (!user || !editProfile) return;
    setIsSaving(true);
    const { error } = await supabase
      .from("users")
      .update(editProfile)
      .eq("id", user.id);

    if (!error) {
      setProfile(editProfile);
    } else {
      console.error("Failed to update profile:", error);
    }
    setIsSaving(false);
  };

  const handleCancel = () => {
    setEditProfile(profile);
  };

  const isDirty = profile && editProfile && JSON.stringify(profile) !== JSON.stringify(editProfile);

  return (
    <MainLayout>
      <div className="flex flex-col w-full max-w-4xl mx-auto min-h-full pt-12 pb-16 px-6">
        <div className="mb-10">
          <h1 className="text-[36px] font-bold text-[#191c1e] tracking-tight mb-3">
            당신의 프로필
          </h1>
          <p className="text-[#454652] text-[18px]">
            가입 시 설정한 기본 정보 및 프롬프트 성향입니다. 정보를 수정할 수 있습니다.
          </p>
        </div>

        <div className="flex flex-col gap-6 relative">
          {/* 사용자 정보 카드 */}
          <div className="bg-white rounded-2xl shadow-sm border border-[rgba(197,197,212,0.15)] p-10 flex flex-col gap-6">
            <div className="flex justify-between items-center w-full">
              <h2 className="text-[22px] font-bold text-[#191c1e] flex items-center gap-2">
                <UserIcon className="w-6 h-6 text-[#2b3896]" />
                사용자 정보
              </h2>
            </div>
            
            {loading ? (
              <div className="text-[#454652]">정보를 불러오는 중...</div>
            ) : editProfile ? (
              <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                <div className="flex flex-col gap-1">
                  <label className="text-[14px] text-[#757684] font-medium">연령 / 성별</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={editProfile.age_group}
                      onChange={(e) => setEditProfile({ ...editProfile, age_group: e.target.value })}
                      className="w-[80px] h-[40px] bg-[#f2f4f6] rounded-[8px] px-3 text-[16px] text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#003e93]/40"
                    />
                    <span className="text-[#191c1e]">세 /</span>
                    <select
                      value={editProfile.gender}
                      onChange={(e) => setEditProfile({ ...editProfile, gender: e.target.value })}
                      className="h-[40px] bg-[#f2f4f6] rounded-[8px] px-3 text-[16px] text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#003e93]/40"
                    >
                      <option value="남성">남성</option>
                      <option value="여성">여성</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex flex-col gap-1">
                  <label className="text-[14px] text-[#757684] font-medium">직업</label>
                  <select
                    value={editProfile.job_role}
                    onChange={(e) => setEditProfile({ ...editProfile, job_role: e.target.value })}
                    className="w-full h-[40px] bg-[#f2f4f6] rounded-[8px] px-3 text-[16px] text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#003e93]/40"
                  >
                    <option value="" disabled>직업군 선택</option>
                    <option value="학생">학생</option>
                    <option value="개발자">개발자</option>
                    <option value="디자이너">디자이너</option>
                    <option value="기획자">기획자</option>
                    <option value="마케터">마케터</option>
                    <option value="기타">기타</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[14px] text-[#757684] font-medium">주요 활용 목적</label>
                  <select
                    value={editProfile.primary_purpose}
                    onChange={(e) => setEditProfile({ ...editProfile, primary_purpose: e.target.value })}
                    className="w-full h-[40px] bg-[#f2f4f6] rounded-[8px] px-3 text-[16px] text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#003e93]/40"
                  >
                    <option value="업무/기획">업무/기획</option>
                    <option value="학업/연구">학업/연구</option>
                    <option value="디자인/예술">디자인/예술</option>
                    <option value="IT/개발">IT/개발</option>
                    <option value="상담/심리">상담/심리</option>
                    <option value="일반/기타">일반/기타</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[14px] text-[#757684] font-medium">선호 답변 스타일</label>
                  <select
                    value={editProfile.preferred_style}
                    onChange={(e) => setEditProfile({ ...editProfile, preferred_style: e.target.value })}
                    className="w-full h-[40px] bg-[#f2f4f6] rounded-[8px] px-3 text-[16px] text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#003e93]/40"
                  >
                    <option value="핵심만 간결하게">핵심만 간결하게</option>
                    <option value="균형있는 설명">균형있는 설명</option>
                    <option value="아주 디테일하게">아주 디테일하게</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="text-[#454652]">사용자 정보가 없습니다. (기본값)</div>
            )}
          </div>

          {/* 가중치 시각화 카드 */}
          <div className="bg-white rounded-2xl shadow-sm border border-[rgba(197,197,212,0.15)] p-10 flex flex-col gap-10">
            <div className="flex justify-between items-center w-full">
              <h2 className="text-[22px] font-bold text-[#191c1e]">사용자 가중치 시각화</h2>
              <div className="bg-[#e4ebf7] px-4 py-2 rounded-full flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#2b3896]" />
                <span className="text-[#2b3896] text-[14px] font-bold">AI 최적화 완료</span>
              </div>
            </div>

            <div className="flex flex-col gap-8 w-full max-w-3xl">
              {userWeights.map((item, idx) => (
                <div key={idx} className="flex flex-col gap-3">
                  <div className="flex justify-between items-end w-full">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#2b3896]" />
                      <span className="text-[16px] font-semibold text-[#454652]">{item.label}</span>
                    </div>
                    <span className="text-[20px] font-bold text-[#2b3896]">{item.value}%</span>
                  </div>
                  <div className="h-3 bg-[#f2f4f6] rounded-full w-full overflow-hidden">
                    <div 
                      className="h-full bg-[#2b3896] rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${item.value}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 하단 적용/취소 버튼 */}
          {isDirty && (
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="px-6 py-2.5 rounded-[8px] bg-white border border-[#c5c5d4] text-[#454652] font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2.5 rounded-[8px] bg-[#3f51b5] text-white font-semibold hover:bg-[#3949a3] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? "저장 중..." : "적용하기"}
              </button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

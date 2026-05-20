"use client";

import { useState, useEffect } from "react";
import { Key, Trash2, Plus, Copy, Check } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface ApiKey {
  id: string;
  key_prefix: string;
  label: string;
  created_at: string;
  last_used_at: string | null;
}

export function McpApiKeysSection() {
  const { language } = useTranslation();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const res = await fetch("/api/mcp-keys");
      const data = await res.json();
      if (data.success) {
        setKeys(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch keys", error);
    } finally {
      setLoading(false);
    }
  };

  const generateKey = async () => {
    setGenerating(true);
    setNewKey(null);
    setCopied(false);
    try {
      const res = await fetch("/api/mcp-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: "MCP Key" }),
      });
      const data = await res.json();
      if (data.success) {
        setNewKey(data.data.rawKey);
        fetchKeys(); // Refresh list
      }
    } catch (error) {
      console.error("Failed to generate key", error);
    } finally {
      setGenerating(false);
    }
  };

  const deleteKey = async (id: string) => {
    if (!confirm(language === "ko" ? "정말로 이 키를 삭제하시겠습니까?" : "Are you sure you want to delete this key?")) {
      return;
    }
    try {
      const res = await fetch(`/api/mcp-keys/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchKeys();
      }
    } catch (error) {
      console.error("Failed to delete key", error);
    }
  };

  const copyToClipboard = () => {
    if (newKey) {
      navigator.clipboard.writeText(newKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section className="bg-white p-[32px] rounded-[12px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] flex flex-col gap-[24px] w-full">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-[12px]">
          <div className="bg-[#e8f0fe] w-[40px] h-[40px] rounded-[8px] flex items-center justify-center shrink-0">
            <Key className="w-[20px] h-[20px] text-[#003e93]" />
          </div>
          <div className="flex flex-col gap-[4px]">
            <h3 className="text-[#191c1e] text-[18px] leading-[28px]">
              {language === 'ko' ? 'MCP API 키' : 'MCP API Keys'}
            </h3>
            <p className="text-[#454652] text-[14px]">
              {language === 'ko' ? '로컬 MCP 클라이언트(Claude Desktop 등) 연결을 위한 키를 관리합니다.' : 'Manage keys for connecting local MCP clients (like Claude Desktop).'}
            </p>
          </div>
        </div>
        <button
          onClick={generateKey}
          disabled={generating}
          className="flex items-center gap-[8px] bg-[#003e93] hover:bg-[#002f70] text-white text-[14px] h-[40px] px-[16px] rounded-[8px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-[16px] h-[16px]" />
          {generating ? (language === 'ko' ? '생성 중...' : 'Generating...') : (language === 'ko' ? '새 키 생성' : 'Generate New Key')}
        </button>
      </div>

      {newKey && (
        <div className="bg-[#e6f4ea] border border-[#ceead6] p-[16px] rounded-[8px] flex flex-col gap-[12px]">
          <p className="text-[#137333] text-[14px] font-medium">
            {language === 'ko' ? '새 API 키가 생성되었습니다. 이 키는 지금 한 번만 표시되므로 안전한 곳에 복사해 두세요.' : 'New API key generated. Please copy it now, as it will not be shown again.'}
          </p>
          <div className="flex items-center gap-[12px]">
            <code className="bg-white px-[12px] py-[8px] rounded-[4px] border border-[#ceead6] text-[#137333] flex-1 break-all select-all">
              {newKey}
            </code>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-[6px] bg-white border border-[#ceead6] hover:bg-[#f1f8f3] text-[#137333] px-[12px] py-[8px] rounded-[4px] transition-colors"
            >
              {copied ? <Check className="w-[16px] h-[16px]" /> : <Copy className="w-[16px] h-[16px]" />}
              {copied ? (language === 'ko' ? '복사됨' : 'Copied') : (language === 'ko' ? '복사' : 'Copy')}
            </button>
          </div>
        </div>
      )}

      <div className="border border-[#e0e0e0] rounded-[8px] overflow-hidden">
        <table className="w-full text-left text-[14px] text-[#454652]">
          <thead className="bg-[#f8f9fa] border-b border-[#e0e0e0] text-[#191c1e]">
            <tr>
              <th className="px-[16px] py-[12px] font-medium">{language === 'ko' ? '라벨' : 'Label'}</th>
              <th className="px-[16px] py-[12px] font-medium">{language === 'ko' ? '키 (Prefix)' : 'Key'}</th>
              <th className="px-[16px] py-[12px] font-medium">{language === 'ko' ? '생성일' : 'Created At'}</th>
              <th className="px-[16px] py-[12px] font-medium">{language === 'ko' ? '최근 사용일' : 'Last Used'}</th>
              <th className="px-[16px] py-[12px] font-medium w-[80px]"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-[16px] py-[24px] text-center text-[#757575]">
                  {language === 'ko' ? '불러오는 중...' : 'Loading...'}
                </td>
              </tr>
            ) : keys.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-[16px] py-[24px] text-center text-[#757575]">
                  {language === 'ko' ? '생성된 API 키가 없습니다.' : 'No API keys generated yet.'}
                </td>
              </tr>
            ) : (
              keys.map((key) => (
                <tr key={key.id} className="border-b border-[#e0e0e0] last:border-b-0 hover:bg-[#f8f9fa]">
                  <td className="px-[16px] py-[12px]">{key.label}</td>
                  <td className="px-[16px] py-[12px] font-mono">{key.key_prefix}••••••••</td>
                  <td className="px-[16px] py-[12px]">
                    {new Date(key.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-[16px] py-[12px]">
                    {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : (language === 'ko' ? '사용 안 함' : 'Never')}
                  </td>
                  <td className="px-[16px] py-[12px]">
                    <button
                      onClick={() => deleteKey(key.id)}
                      className="p-[8px] text-[#757575] hover:text-[#ba1a1a] hover:bg-[#ba1a1a]/10 rounded-full transition-colors"
                      title={language === 'ko' ? '삭제' : 'Delete'}
                    >
                      <Trash2 className="w-[16px] h-[16px]" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

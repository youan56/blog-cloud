"use client";

/**
 * @file MusicSection.tsx - 网易云音乐管理（云端版）
 * @description 管理绑定的网易云歌曲 ID，支持在线查询歌曲信息
 * @adapted 从原版适配，移除本地 Python API 依赖
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MusicSection({ formData, handleUpdate }: any) {
  // 歌曲详情缓存
  const [musicDetails, setMusicDetails] = useState<Record<string, any>>({});
  // 新 ID 输入
  const [newMusicId, setNewMusicId] = useState('');
  // 查询状态
  const [queryLoading, setQueryLoading] = useState(false);
  // 查询结果
  const [queryResult, setQueryResult] = useState<any>(null);

  const cloudMusicIds: string[] = formData.cloudMusicIds || [];

  // 加载歌曲详情
  useEffect(() => {
    cloudMusicIds.forEach((id: string) => {
      if (id && !musicDetails[id]) {
        fetchSongDetail(id);
      }
    });
  }, [cloudMusicIds.join(',')]);

  // 查询网易云歌曲详情（通过公开 API）
  const fetchSongDetail = async (id: string) => {
    try {
      const res = await fetch(`https://music.163.com/api/song/detail?id=${id}&ids=%5B${id}%5D`);
      const data = await res.json();
      if (data.songs && data.songs.length > 0) {
        const song = data.songs[0];
        setMusicDetails(prev => ({
          ...prev,
          [id]: {
            name: song.name,
            artist: song.artists?.map((a: any) => a.name).join('/') || '未知',
            cover: song.album?.picUrl ? `${song.album.picUrl}?param=100y100` : '',
          }
        }));
      } else {
        setMusicDetails(prev => ({ ...prev, [id]: { error: true, name: '未找到歌曲' } }));
      }
    } catch {
      setMusicDetails(prev => ({ ...prev, [id]: { error: true, name: '查询失败' } }));
    }
  };

  // 校验并添加新歌曲
  const queryMusic = async () => {
    const id = newMusicId.trim();
    if (!id) return;
    if (cloudMusicIds.includes(id)) {
      setQueryResult({ error: true, name: '该 ID 已存在' });
      return;
    }
    setQueryLoading(true);
    setQueryResult(null);
    try {
      const res = await fetch(`https://music.163.com/api/song/detail?id=${id}&ids=%5B${id}%5D`);
      const data = await res.json();
      if (data.songs && data.songs.length > 0) {
        const song = data.songs[0];
        setQueryResult({
          id,
          name: song.name,
          artist: song.artists?.map((a: any) => a.name).join('/') || '未知',
          cover: song.album?.picUrl ? `${song.album.picUrl}?param=100y100` : '',
        });
      } else {
        setQueryResult({ error: true, name: '未找到该歌曲，请检查 ID' });
      }
    } catch {
      setQueryResult({ error: true, name: '查询失败，请稍后重试' });
    } finally {
      setQueryLoading(false);
    }
  };

  // 确认添加
  const confirmAddMusic = () => {
    if (!queryResult || queryResult.error) return;
    const updated = [...cloudMusicIds, queryResult.id];
    handleUpdate('cloudMusicIds', updated);
    // 缓存详情
    setMusicDetails(prev => ({
      ...prev,
      [queryResult.id]: { name: queryResult.name, artist: queryResult.artist, cover: queryResult.cover }
    }));
    setQueryResult(null);
    setNewMusicId('');
  };

  // 删除歌曲
  const removeSong = (index: number) => {
    const updated = cloudMusicIds.filter((_: any, i: number) => i !== index);
    handleUpdate('cloudMusicIds', updated);
  };

  return (
    <motion.section
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="w-full bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/50 dark:border-slate-800/50 rounded-[40px] p-8 shadow-2xl"
    >
      <h2 className="text-xl font-black text-slate-800 dark:text-white mb-8">🎵 歌单管理与查询</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* 左侧：已绑定歌曲列表 */}
        <div className="space-y-3">
          <p className="text-[10px] font-black text-slate-400 uppercase ml-1 mb-4">
            当前绑定的网易云 ID ({cloudMusicIds.length})
          </p>
          <div className="max-h-[400px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
            {cloudMusicIds.map((id: string, index: number) => {
              const detail = musicDetails[id];
              return (
                <div key={index} className="flex justify-between items-center p-3 bg-white/40 dark:bg-slate-800/40 rounded-2xl border border-white/20 group">
                  <div className="flex items-center gap-3">
                    {detail?.cover ? (
                      <img src={detail.cover} alt="cover" className="w-10 h-10 rounded-lg object-cover shadow-sm" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse flex items-center justify-center text-xs">💿</div>
                    )}
                    <div className="flex flex-col">
                      {detail ? (
                        <>
                          <span className={`text-sm font-bold line-clamp-1 ${detail.error ? 'text-red-500' : 'text-slate-800 dark:text-white'}`}>
                            {detail.name}
                          </span>
                          {!detail.error && <span className="text-[10px] text-slate-500 font-medium">{detail.artist}</span>}
                        </>
                      ) : (
                        <span className="text-xs text-slate-400">正在解析...</span>
                      )}
                      <span className="text-[10px] font-mono text-pink-500 mt-0.5">#{id}</span>
                    </div>
                  </div>
                  <button onClick={() => removeSong(index)} className="w-8 h-8 shrink-0 rounded-lg bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white flex items-center justify-center">✕</button>
                </div>
              );
            })}
            {cloudMusicIds.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">还没有绑定歌曲，右侧添加一首吧~</p>
            )}
          </div>
        </div>

        {/* 右侧：添加新歌曲 */}
        <div className="bg-slate-100/50 dark:bg-slate-800/50 rounded-3xl p-6 space-y-6">
          <p className="text-[10px] font-black text-slate-400 uppercase">校验并添加新 ID</p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="输入歌曲 ID"
              value={newMusicId}
              onChange={e => setNewMusicId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && queryMusic()}
              className="flex-1 bg-white dark:bg-slate-900 border-none rounded-2xl px-4 py-3 text-sm outline-none shadow-sm"
            />
            <button onClick={queryMusic} disabled={queryLoading} className="px-6 py-3 bg-pink-500 text-white rounded-2xl text-xs font-black shadow-lg shadow-pink-500/20 disabled:opacity-50">
              {queryLoading ? "请求中..." : "真实查询"}
            </button>
          </div>

          <AnimatePresence>
            {queryResult && !queryResult.error && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-3 bg-white dark:bg-slate-900 rounded-2xl border-2 border-green-500/30 flex justify-between items-center shadow-xl">
                <div className="flex items-center gap-3">
                  <img src={queryResult.cover} alt="cover" className="w-10 h-10 rounded-lg object-cover" />
                  <div>
                    <p className="text-[10px] font-black text-green-600">获取成功</p>
                    <p className="text-xs font-bold line-clamp-1">{queryResult.name}</p>
                  </div>
                </div>
                <button onClick={confirmAddMusic} className="px-3 py-2 bg-green-500 text-white rounded-xl text-[10px] font-black shrink-0 hover:bg-green-600 transition-colors">存入列表</button>
              </motion.div>
            )}
            {queryResult?.error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800 text-center">
                <p className="text-xs text-red-500 font-bold">{queryResult.name}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ID 获取说明 */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-4">
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold mb-2">💡 如何获取网易云音乐 ID？</p>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              1. 打开网易云音乐网页版，找到你喜欢的歌曲<br/>
              2. 点击分享 → 复制链接<br/>
              3. 链接中 <strong>id=</strong> 后面的数字就是歌曲 ID<br/>
              4. 例如：music.163.com/song?id=<strong>1809646618</strong>
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

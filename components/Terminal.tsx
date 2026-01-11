
import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';

interface Props {
  logs: LogEntry[];
}

const Terminal: React.FC<Props> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="w-full h-full overflow-y-auto custom-scrollbar font-mono text-[10px] md:text-xs">
      <div className="text-gray-500 mb-4 pb-2 border-b border-white/5 opacity-50 select-none">
        root@omniforge:~# ./init_sequence.sh --verbose
      </div>
      <div className="flex flex-col gap-2">
        {logs.map((log) => (
          <div key={log.id} className="flex gap-3 items-start animate-fade-in group">
            <span className="text-gray-700 shrink-0 select-none w-14 group-hover:text-gray-500 transition-colors">[{log.timestamp}]</span>
            <span className={`break-words flex-1
              ${log.type === 'error' ? 'text-red-400' : ''}
              ${log.type === 'success' ? 'text-omni-primary' : ''}
              ${log.type === 'warning' ? 'text-yellow-400' : ''}
              ${log.type === 'info' ? 'text-gray-400' : ''}
              ${log.type === 'fix' ? 'text-blue-400' : ''}
            `}>
              {log.type === 'success' && '➜ '}
              {log.type === 'error' && '✖ '}
              {log.type === 'warning' && '⚠ '}
              {log.message}
            </span>
          </div>
        ))}
        {logs.length === 0 && <span className="text-gray-800 italic">Waiting for input stream...</span>}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default Terminal;

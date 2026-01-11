
import React, { useCallback } from 'react';
import { Upload, FileCode, Monitor, Hammer, Server, HardDrive } from 'lucide-react';

interface Props {
  onFileSelect: (file: File) => void;
  mode: 'convert' | 'create' | 'build';
  buildType?: 'gradle' | 'maven';
}

const FileUploader: React.FC<Props> = ({ onFileSelect, mode, buildType }) => {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        onFileSelect(e.dataTransfer.files[0]);
      }
    },
    [onFileSelect]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const acceptedExts = mode === 'build' ? ".zip" : ".jar,.exe";

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="w-full border border-dashed border-white/10 hover:border-omni-primary/50 bg-white/[0.02] hover:bg-omni-primary/[0.05] transition-all duration-300 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer group h-48"
    >
      <input
        type="file"
        id="file-upload"
        className="hidden"
        accept={acceptedExts}
        onChange={handleChange}
      />
      <label htmlFor="file-upload" className="flex flex-col items-center cursor-pointer w-full h-full justify-center">
        <div className="w-12 h-12 bg-black/40 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-white/5 group-hover:border-omni-primary">
          <Upload className="w-5 h-5 text-gray-500 group-hover:text-omni-primary" />
        </div>
        <p className="text-gray-400 text-sm font-medium mb-1 group-hover:text-white transition-colors text-center">
          {mode === 'build' ? 'Drop Source Code' : 'Drop Binary File'}
        </p>
        <span className="text-[10px] text-gray-600 font-mono">
          {mode === 'build' ? '.zip supported' : '.jar / .exe'}
        </span>
      </label>
    </div>
  );
};

export default FileUploader;

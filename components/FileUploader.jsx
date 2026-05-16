"use client"

import React, { useState } from 'react';
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

const FileUploader = ({ workbookId, onUploadComplete }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const createFile = useMutation(api.files.createFile);
  const updateFileStatus = useMutation(api.files.updateStatus);
  const createSheet = useMutation(api.sheets.create);

  const processFiles = async (files) => {
    if (files.length === 0) return;

    setIsUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProgress(`Processing ${file.name} (${i + 1}/${files.length})...`);

      try {
        // 1. Get upload URL from Convex
        const postUrl = await generateUploadUrl();

        // 2. Upload file to Convex Storage
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": file.type || "application/octet-stream" },
          body: file,
        });
        const { storageId } = await result.json();

        // 3. Create file record in Convex
        const fileId = await createFile({
          workbookId,
          storageId,
          name: file.name,
          type: file.name.split('.').pop().toLowerCase(),
        });

        // 4. Parse file
        const reader = new FileReader();
        
        await new Promise((resolve, reject) => {
          reader.onload = async (evt) => {
            try {
              let workbookData = [];
              let sheetNames = [];

              if (file.name.endsWith('.json')) {
                const text = evt.target.result;
                const json = JSON.parse(text);
                workbookData = [{ name: "JSON Data", data: Array.isArray(json) ? json : [json] }];
                sheetNames = ["JSON Data"];
              } else {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                sheetNames = wb.SheetNames;
                workbookData = sheetNames.map(name => ({
                  name,
                  data: XLSX.utils.sheet_to_json(wb.Sheets[name])
                }));
              }

              const metadata = {
                sheetNames,
                rowCount: {},
              };

              // 5. Save each sheet to Convex
              for (let j = 0; j < workbookData.length; j++) {
                const { name, data } = workbookData[j];
                const previewData = data.slice(0, 1000);
                metadata.rowCount[name] = data.length;

                await createSheet({
                  fileId,
                  name,
                  data: previewData,
                  order: j,
                });
              }

              // 6. Update file status
              await updateFileStatus({
                id: fileId,
                status: "ready",
                metadata,
              });

              resolve();
            } catch (err) {
              reject(err);
            }
          };
          
          if (file.name.endsWith('.json')) {
            reader.readAsText(file);
          } else {
            reader.readAsBinaryString(file);
          }
        });

        toast.success(`Successfully uploaded ${file.name}`);
        if (i === files.length - 1) {
          onUploadComplete?.(fileId);
        }

      } catch (error) {
        console.error(error);
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    setIsUploading(false);
    setProgress("");
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    processFiles(files);
  };

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-[2.5rem] transition-all group ${
        isDragging 
          ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20 scale-[1.02]" 
          : "border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 hover:bg-emerald-50/30"
      }`}
    >
      {isUploading ? (
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
          <p className="text-sm font-black uppercase tracking-widest text-slate-500">{progress}</p>
        </div>
      ) : (
        <label className="flex flex-col items-center cursor-pointer space-y-4">
          <div className={`h-20 w-20 rounded-[2rem] shadow-xl border transition-all flex items-center justify-center ${
            isDragging 
              ? "bg-emerald-100 border-emerald-300 scale-110" 
              : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 group-hover:bg-emerald-100 group-hover:border-emerald-200"
          }`}>
            <Upload className={`w-8 h-8 transition-colors ${
              isDragging ? "text-emerald-600" : "text-slate-400 group-hover:text-emerald-600"
            }`} />
          </div>
          <div className="text-center">
            <h3 className="font-black text-xl text-slate-900 dark:text-white">Upload Spreadsheet</h3>
            <p className="text-xs font-medium text-slate-400">Excel (xlsx), CSV, or JSON</p>
          </div>
          <input type="file" className="hidden" accept=".xlsx,.xls,.csv,.json" multiple onChange={handleFileUpload} />
        </label>
      )}
    </div>
  );
};

export default FileUploader;

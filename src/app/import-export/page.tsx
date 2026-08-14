'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store/appStore';
import * as XLSX from 'xlsx';
import { formatVND } from '@/lib/finance/portfolio';
import { useToast } from '@/components/feedback/ToastProvider';

interface RawExcelRow {
  [key: string]: any;
}

interface ValidatedRow {
  index: number;
  date: string;
  fundCode: string;
  type: 'BUY' | 'SELL';
  amount: number;
  unitPrice: number;
  units: number;
  fee: number;
  notes: string;
  isValid: boolean;
  errorReason?: string;
}

export default function ImportExportPage() {
  const { funds, portfolios, addBulkTransactions, transactions, holdings } = useAppStore();
  const { showToast } = useToast();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [fileName, setFileName] = useState('');
  const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<RawExcelRow[]>([]);

  const [columnMapping, setColumnMapping] = useState<{ [key: string]: string }>({
    date: '',
    fundCode: '',
    type: '',
    amount: '',
    unitPrice: '',
    units: '',
    fee: '',
    notes: '',
  });

  const [targetPortfolioId, setTargetPortfolioId] = useState<string>(portfolios[0]?.id || 'p_main');
  const [validatedRows, setValidatedRows] = useState<ValidatedRow[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheet];

        const json: RawExcelRow[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        if (json.length > 0) {
          const headers = (json[0] as string[]).map((h) => String(h).trim());
          setExcelHeaders(headers);

          const dataRows = json.slice(1).map((row: any) => {
            const rowObj: RawExcelRow = {};
            headers.forEach((h, idx) => {
              rowObj[h] = row[idx];
            });
            return rowObj;
          });
          setRawRows(dataRows);

          const autoMap: { [key: string]: string } = {};
          headers.forEach((h) => {
            const lower = h.toLowerCase();
            if (lower.includes('ngày') || lower.includes('date')) autoMap.date = h;
            else if (lower.includes('quỹ') || lower.includes('fund') || lower.includes('mã')) autoMap.fundCode = h;
            else if (lower.includes('loại') || lower.includes('type')) autoMap.type = h;
            else if (lower.includes('tiền') || lower.includes('amount') || lower.includes('vốn')) autoMap.amount = h;
            else if (lower.includes('nav') || lower.includes('giá') || lower.includes('price')) autoMap.unitPrice = h;
            else if (lower.includes('ccq') || lower.includes('units') || lower.includes('số lượng')) autoMap.units = h;
            else if (lower.includes('phí') || lower.includes('fee')) autoMap.fee = h;
            else if (lower.includes('ghi chú') || lower.includes('note')) autoMap.notes = h;
          });

          setColumnMapping((prev) => ({ ...prev, ...autoMap }));
          setStep(2);
        }
      } catch (err) {
        showToast('error', 'Không đọc được file. Hãy kiểm tra định dạng .xlsx, .xls hoặc .csv.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleValidateMapping = () => {
    const validFunds = new Set(funds.map((f) => f.code.toUpperCase()));

    const validated: ValidatedRow[] = rawRows.map((row, idx) => {
      const rawDate = row[columnMapping.date];
      const rawFund = String(row[columnMapping.fundCode] || '').trim().toUpperCase();
      const rawType = String(row[columnMapping.type] || '').trim().toUpperCase();
      const rawAmount = parseFloat(String(row[columnMapping.amount] || '0').replace(/,/g, '')) || 0;
      const rawPrice = parseFloat(String(row[columnMapping.unitPrice] || '0').replace(/,/g, '')) || 0;
      const rawUnits = parseFloat(String(row[columnMapping.units] || '0').replace(/,/g, '')) || (rawPrice > 0 ? rawAmount / rawPrice : 0);
      const rawFee = parseFloat(String(row[columnMapping.fee] || '0').replace(/,/g, '')) || 0;
      const notes = String(row[columnMapping.notes] || '');

      let isValid = true;
      let errorReason = '';

      if (!rawFund || !validFunds.has(rawFund)) {
        isValid = false;
        errorReason = `Mã quỹ không hợp lệ (${rawFund})`;
      } else if (rawAmount <= 0) {
        isValid = false;
        errorReason = 'Số tiền phải > 0';
      }

      const txType = rawType.includes('BÁN') || rawType.includes('SELL') ? 'SELL' : 'BUY';

      let formattedDate = new Date().toISOString().split('T')[0];
      if (typeof rawDate === 'number') {
        const jsDate = new Date((rawDate - (25567 + 2)) * 86400 * 1000);
        formattedDate = jsDate.toISOString().split('T')[0];
      } else if (typeof rawDate === 'string' && rawDate.trim()) {
        const parts = rawDate.trim().split(/[-/]/);
        if (parts.length === 3) {
          if (parts[0].length === 4) formattedDate = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
          else formattedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
      }

      return {
        index: idx + 1,
        date: formattedDate,
        fundCode: rawFund,
        type: txType,
        amount: rawAmount,
        unitPrice: rawPrice,
        units: rawUnits,
        fee: rawFee,
        notes,
        isValid,
        errorReason,
      };
    });

    setValidatedRows(validated);
    setStep(3);
  };

  const handleConfirmImport = () => {
    const validRowsToImport = validatedRows.filter((r) => r.isValid);
    if (validRowsToImport.length === 0) {
      showToast('error', 'Không có giao dịch hợp lệ để nhập. Hãy kiểm tra các cột và mã quỹ.');
      return;
    }

    const newTransactions = validRowsToImport.map((r) => {
      const fund = funds.find((f) => f.code === r.fundCode);
      return {
        portfolioId: targetPortfolioId,
        fundId: fund?.id || 'f_' + r.fundCode.toLowerCase(),
        fundCode: r.fundCode,
        type: r.type,
        date: r.date,
        amount: r.amount,
        unitPrice: r.unitPrice,
        units: r.units,
        fee: r.fee,
        notes: r.notes ? `[Excel] ${r.notes}` : '[Imported from Excel]',
      };
    });

    addBulkTransactions(newTransactions);
    setStep(1);
    setFileName('');
  };

  const handleExportJSON = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      transactions,
      holdings,
      portfolios,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FundTracker_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'Đã tải file sao lưu JSON.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 500, color: 'var(--md-sys-color-on-surface)' }}>
          Import & Export Dữ Liệu
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--md-sys-color-on-surface-variant)', marginTop: '2px' }}>
          Đồng bộ sao kê từ file Excel hoặc sao lưu dữ liệu sang JSON
        </p>
      </div>

      {/* Export Section */}
      <div className="m3-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 500, color: 'var(--md-sys-color-on-surface)' }}>
          Sao Lưu Dữ Liệu (Export)
        </h2>
        <p style={{ fontSize: '12px', color: 'var(--md-sys-color-on-surface-variant)' }}>
          Xuất toàn bộ lịch sử giao dịch và danh mục hiện tại ra file JSON dự phòng.
        </p>
        <button onClick={handleExportJSON} className="m3-pill-btn" style={{ alignSelf: 'flex-start' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--md-sys-color-primary)' }}>download</span>
          Tải File Sao Lưu JSON
        </button>
      </div>

      {/* Import Section */}
      <div className="m3-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 500, color: 'var(--md-sys-color-on-surface)' }}>
            Nhập Giao Dịch Từ Excel (Import)
          </h2>
          <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--md-sys-color-primary)' }}>
            Bước {step}/3
          </span>
        </div>

        {/* Step 1: Upload File */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div
              style={{
                border: '2px dashed var(--md-sys-color-outline-variant)',
                borderRadius: '20px',
                padding: '36px 20px',
                textAlign: 'center',
                backgroundColor: 'var(--md-sys-color-surface-container-low)',
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer',
                }}
              />
              <div className="m3-icon-badge-blue" style={{ margin: '0 auto 12px auto' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>upload_file</span>
              </div>
              <h4 style={{ fontSize: '14px', fontWeight: 500, color: 'var(--md-sys-color-on-surface)' }}>
                Chọn file Excel (.xlsx, .csv)
              </h4>
              <p style={{ fontSize: '11px', color: 'var(--md-sys-color-on-surface-variant)', marginTop: '4px' }}>
                Kéo thả hoặc click để duyệt file sao kê từ công ty quản lý quỹ
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Column Mapping */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--md-sys-color-on-surface)' }}>
              Đang mở: <span style={{ color: 'var(--md-sys-color-primary)' }}>{fileName}</span> ({rawRows.length} dòng)
            </div>

            <div className="m3-form-group">
              <label className="m3-form-label">Danh mục đích nhập vào</label>
              <select
                value={targetPortfolioId}
                onChange={(e) => setTargetPortfolioId(e.target.value)}
                className="m3-select"
              >
                {portfolios.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="m3-form-group">
                <label className="m3-form-label">Cột Ngày (*)</label>
                <select
                  value={columnMapping.date}
                  onChange={(e) => setColumnMapping({ ...columnMapping, date: e.target.value })}
                  className="m3-select"
                >
                  <option value="">-- Chọn cột --</option>
                  {excelHeaders.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              <div className="m3-form-group">
                <label className="m3-form-label">Cột Mã Quỹ (*)</label>
                <select
                  value={columnMapping.fundCode}
                  onChange={(e) => setColumnMapping({ ...columnMapping, fundCode: e.target.value })}
                  className="m3-select"
                >
                  <option value="">-- Chọn cột --</option>
                  {excelHeaders.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              <div className="m3-form-group">
                <label className="m3-form-label">Cột Loại Lệnh</label>
                <select
                  value={columnMapping.type}
                  onChange={(e) => setColumnMapping({ ...columnMapping, type: e.target.value })}
                  className="m3-select"
                >
                  <option value="">-- Chọn cột --</option>
                  {excelHeaders.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              <div className="m3-form-group">
                <label className="m3-form-label">Cột Tổng Tiền (*)</label>
                <select
                  value={columnMapping.amount}
                  onChange={(e) => setColumnMapping({ ...columnMapping, amount: e.target.value })}
                  className="m3-select"
                >
                  <option value="">-- Chọn cột --</option>
                  {excelHeaders.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              <div className="m3-form-group">
                <label className="m3-form-label">Cột Giá NAV</label>
                <select
                  value={columnMapping.unitPrice}
                  onChange={(e) => setColumnMapping({ ...columnMapping, unitPrice: e.target.value })}
                  className="m3-select"
                >
                  <option value="">-- Chọn cột --</option>
                  {excelHeaders.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              <div className="m3-form-group">
                <label className="m3-form-label">Cột Số CCQ</label>
                <select
                  value={columnMapping.units}
                  onChange={(e) => setColumnMapping({ ...columnMapping, units: e.target.value })}
                  className="m3-select"
                >
                  <option value="">-- Chọn cột --</option>
                  {excelHeaders.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button type="button" onClick={() => setStep(1)} className="m3-pill-btn" style={{ flex: 1 }}>
                Quay Lại
              </button>
              <button type="button" onClick={handleValidateMapping} className="m3-pill-btn-primary" style={{ flex: 1 }}>
                Kiểm Tra Dữ Liệu →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Confirm */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--md-sys-color-on-surface)' }}>
                Hợp lệ: {validatedRows.filter((r) => r.isValid).length} / {validatedRows.length} dòng
              </span>
            </div>

            <div className="m3-table-container" style={{ maxHeight: '240px' }}>
              <table className="m3-table">
                <thead>
                  <tr>
                    <th>Ngày</th>
                    <th>Quỹ</th>
                    <th>Loại</th>
                    <th>Tổng tiền</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {validatedRows.map((r) => (
                    <tr key={r.index}>
                      <td>{r.date}</td>
                      <td style={{ fontWeight: 500 }}>{r.fundCode}</td>
                      <td>{r.type}</td>
                      <td>{formatVND(r.amount)}</td>
                      <td>
                        {r.isValid ? (
                          <span className="badge-positive" style={{ fontSize: '10px' }}>Hợp lệ</span>
                        ) : (
                          <span className="badge-negative" style={{ fontSize: '10px' }}>{r.errorReason}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button type="button" onClick={() => setStep(2)} className="m3-pill-btn" style={{ flex: 1 }}>
                Sửa Cột
              </button>
              <button type="button" onClick={handleConfirmImport} className="m3-pill-btn-primary" style={{ flex: 1 }}>
                Xác Nhận Nhập Dữ Liệu
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store/appStore';
import * as XLSX from 'xlsx';
import { formatVND } from '@/lib/finance/portfolio';

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
        alert('Lỗi khi đọc file Excel. Vui lòng kiểm tra file định dạng .xlsx hoặc .csv');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleValidateMapping = () => {
    const validFunds = new Set(funds.map((f) => f.code.toUpperCase()));

    const rows: ValidatedRow[] = rawRows.map((row, idx) => {
      const rawDate = row[columnMapping.date];
      const rawFund = String(row[columnMapping.fundCode] || '').trim().toUpperCase();
      const rawType = String(row[columnMapping.type] || '').trim().toUpperCase();
      const rawAmount = parseFloat(row[columnMapping.amount]) || 0;
      const rawPrice = parseFloat(row[columnMapping.unitPrice]) || 0;
      let rawUnits = parseFloat(row[columnMapping.units]) || 0;
      const rawFee = parseFloat(row[columnMapping.fee]) || 0;
      const rawNotes = String(row[columnMapping.notes] || '');

      let isValid = true;
      let errorReason = '';

      if (!rawFund) {
        isValid = false;
        errorReason = 'Thiếu mã quỹ';
      } else if (!validFunds.has(rawFund)) {
        isValid = false;
        errorReason = `Mã quỹ "${rawFund}" chưa có trong hệ thống`;
      }

      if (rawPrice <= 0 && rawAmount <= 0) {
        isValid = false;
        errorReason = 'Giá NAV hoặc Số tiền phải lớn hơn 0';
      }

      if (rawUnits <= 0 && rawPrice > 0 && rawAmount > 0) {
        rawUnits = rawAmount / rawPrice;
      }

      let parsedType: 'BUY' | 'SELL' = 'BUY';
      if (rawType.includes('BÁN') || rawType.includes('SELL')) {
        parsedType = 'SELL';
      }

      let formattedDate = new Date().toISOString().split('T')[0];
      if (rawDate) {
        if (typeof rawDate === 'number') {
          const jsDate = new Date((rawDate - (25567 + 2)) * 86400 * 1000);
          formattedDate = jsDate.toISOString().split('T')[0];
        } else {
          formattedDate = String(rawDate).split('T')[0];
        }
      }

      return {
        index: idx + 1,
        date: formattedDate,
        fundCode: rawFund || 'UNKNOWN',
        type: parsedType,
        amount: rawAmount,
        unitPrice: rawPrice,
        units: rawUnits,
        fee: rawFee,
        notes: rawNotes,
        isValid,
        errorReason,
      };
    });

    setValidatedRows(rows);
    setStep(3);
  };

  const handleExecuteImport = () => {
    const validOnly = validatedRows.filter((r) => r.isValid);
    if (validOnly.length === 0) {
      alert('Không có dòng dữ liệu hợp lệ nào để nạp!');
      return;
    }

    const txsToAdd = validOnly.map((r) => {
      const fundObj = funds.find((f) => f.code === r.fundCode);
      return {
        portfolioId: targetPortfolioId,
        fundId: fundObj?.id || 'f_' + r.fundCode.toLowerCase(),
        fundCode: r.fundCode,
        type: r.type,
        date: r.date,
        amount: r.amount,
        unitPrice: r.unitPrice,
        units: r.units,
        fee: r.fee,
        notes: r.notes || 'Import từ Excel: ' + fileName,
      };
    });

    addBulkTransactions(txsToAdd);
    alert(`Đã import thành công ${txsToAdd.length} giao dịch vào hệ thống!`);
    setStep(1);
    setFileName('');
  };

  const exportTransactionsToExcel = () => {
    const dataToExport = transactions.map((t, idx) => ({
      STT: idx + 1,
      'Ngày Giao Dịch': t.date,
      'Loại Giao Dịch': t.type === 'BUY' ? 'MUA' : 'BÁN',
      'Mã Quỹ': t.fundCode,
      'Số Tiền (VND)': t.amount,
      'Giá NAV/CCQ': t.unitPrice,
      'Số Lượng CCQ': t.units,
      'Phí Giao Dịch': t.fee,
      'Ghi Chú': t.notes || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lịch Sử Giao Dịch');
    XLSX.writeFile(workbook, `NhatKyQuy_GiaoDich_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportHoldingsToExcel = () => {
    const dataToExport = holdings.map((h, idx) => ({
      STT: idx + 1,
      'Mã Quỹ': h.fundCode,
      'Tên Quỹ': h.fundName,
      'Số Lượng Nắm Giữ': h.totalUnits,
      'Giá Vốn Bình Quân': h.avgCostBasis,
      'NAV Hiện Tại': h.currentNav,
      'Tổng Vốn Đầu Tư': h.totalCost,
      'Giá Trị Hiện Tại': h.currentValue,
      'Lãi/Lỗ (VND)': h.unrealizedPnL,
      'Tỷ Suất Lợi Nhuận (%)': h.unrealizedPnLPercent.toFixed(2) + '%',
      'Tỷ Trọng Danh Mục (%)': h.weightPercent.toFixed(2) + '%',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh Mục Nắm Giữ');
    XLSX.writeFile(workbook, `NhatKyQuy_DanhMuc_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#E2E2E6' }}>
          Import & Export Excel
        </h1>
        <p style={{ fontSize: '13px', color: '#909299', marginTop: '2px' }}>
          Đồng bộ giao dịch hàng loạt từ file Excel cá nhân
        </p>
      </div>

      {/* 1. Export Section - Pixel Action Tiles */}
      <div className="m3-card-dark">
        <h3 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '12px', color: '#909299', textTransform: 'uppercase' }}>
          Xuất Báo Cáo Excel
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={exportTransactionsToExcel}
            className="m3-pill-btn"
            style={{
              justifyContent: 'flex-start',
              padding: '12px 16px',
              borderRadius: '20px',
              backgroundColor: '#191B1F',
            }}
          >
            <div className="m3-icon-badge-blue" style={{ width: '34px', height: '34px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>table_chart</span>
            </div>
            <div style={{ textAlign: 'left', flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#E2E2E6' }}>Xuất Toàn Bộ Giao Dịch (.xlsx)</div>
              <div style={{ fontSize: '11px', color: '#909299' }}>Bao gồm ngày, loại lệnh, số tiền, giá NAV, phí</div>
            </div>
          </button>

          <button
            onClick={exportHoldingsToExcel}
            className="m3-pill-btn"
            style={{
              justifyContent: 'flex-start',
              padding: '12px 16px',
              borderRadius: '20px',
              backgroundColor: '#191B1F',
            }}
          >
            <div className="m3-icon-badge-cyan" style={{ width: '34px', height: '34px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>pie_chart</span>
            </div>
            <div style={{ textAlign: 'left', flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#E2E2E6' }}>Xuất Báo Cáo Danh Mục (.xlsx)</div>
              <div style={{ fontSize: '11px', color: '#909299' }}>Bao gồm giá vốn bình quân, NAV hiện tại, ROI %</div>
            </div>
          </button>
        </div>
      </div>

      {/* 2. Import Section - Pixel Stepper & Dropzone */}
      <div className="m3-card-dark">
        <h3 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '12px', color: '#909299', textTransform: 'uppercase' }}>
          Nhập Giao Dịch Từ Excel (Import)
        </h3>

        {/* Step Indicator */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
          {[
            { num: 1, label: 'Chọn File' },
            { num: 2, label: 'Ghép Cột' },
            { num: 3, label: 'Kiểm Tra' },
          ].map((s) => (
            <div
              key={s.num}
              style={{
                flex: 1,
                padding: '8px 10px',
                borderRadius: '16px',
                backgroundColor: step === s.num ? '#282B31' : '#191B1F',
                color: step === s.num ? '#A8C7FA' : '#909299',
                fontSize: '11px',
                fontWeight: 800,
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <span
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  backgroundColor: step === s.num ? '#A8C7FA' : '#44474E',
                  color: step === s.num ? '#041E49' : '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: 900,
                }}
              >
                {s.num}
              </span>
              {s.label}
            </div>
          ))}
        </div>

        {/* Step 1: Upload File */}
        {step === 1 && (
          <div
            style={{
              border: '2px dashed #44474E',
              borderRadius: '24px',
              padding: '32px 16px',
              textAlign: 'center',
              backgroundColor: '#191B1F',
            }}
          >
            <div className="m3-icon-badge-blue" style={{ width: '52px', height: '52px', margin: '0 auto 12px auto' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>cloud_upload</span>
            </div>
            <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#E2E2E6', marginBottom: '4px' }}>
              Kéo & Thả File Excel Giao Dịch vào đây
            </h4>
            <p style={{ fontSize: '12px', color: '#909299', marginBottom: '16px' }}>
              Hỗ trợ định dạng .xlsx, .xls, .csv
            </p>
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              id="excel-upload-input"
            />
            <label
              htmlFor="excel-upload-input"
              className="m3-pill-btn-primary"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                folder_open
              </span>
              Chọn File Từ Thiết Bị
            </label>
          </div>
        )}

        {/* Step 2: Mapping Columns */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#A8C7FA' }}>
              File: {fileName} ({rawRows.length} dòng)
            </div>

            <div className="m3-form-group">
              <label className="m3-form-label">Danh mục nạp vào</label>
              <select
                value={targetPortfolioId}
                onChange={(e) => setTargetPortfolioId(e.target.value)}
                className="m3-select"
              >
                {portfolios.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                { label: 'Cột Ngày Giao Dịch *', key: 'date' },
                { label: 'Cột Mã Quỹ (Code) *', key: 'fundCode' },
                { label: 'Cột Loại (Mua/Bán) *', key: 'type' },
                { label: 'Cột Số Tiền (VND) *', key: 'amount' },
                { label: 'Cột Giá NAV / CCQ', key: 'unitPrice' },
                { label: 'Cột Số Lượng CCQ', key: 'units' },
                { label: 'Cột Phí Giao Dịch', key: 'fee' },
                { label: 'Cột Ghi Chú', key: 'notes' },
              ].map((item) => (
                <div key={item.key} className="m3-form-group">
                  <label className="m3-form-label">{item.label}</label>
                  <select
                    value={columnMapping[item.key] || ''}
                    onChange={(e) => setColumnMapping({ ...columnMapping, [item.key]: e.target.value })}
                    className="m3-select"
                  >
                    <option value="">-- Chọn Cột --</option>
                    {excelHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button
                onClick={() => setStep(1)}
                className="m3-pill-btn"
                style={{ flex: 1 }}
              >
                Quay lại
              </button>
              <button
                onClick={handleValidateMapping}
                className="m3-pill-btn-primary"
                style={{ flex: 1 }}
              >
                Tiếp Tục →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Validate & Import */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#E2E2E6' }}>Kiểm Tra Dữ Liệu</h4>
                <p style={{ fontSize: '11px', color: '#909299' }}>
                  Hợp lệ: {validatedRows.filter((r) => r.isValid).length} dòng • Lỗi: {validatedRows.filter((r) => !r.isValid).length} dòng
                </p>
              </div>

              <button
                onClick={handleExecuteImport}
                className="m3-pill-btn-primary"
                style={{ backgroundColor: '#85D397', color: '#003914' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
                Nạp {validatedRows.filter((r) => r.isValid).length} Giao Dịch
              </button>
            </div>

            <div className="m3-table-container">
              <table className="m3-table">
                <thead>
                  <tr>
                    <th>Dòng</th>
                    <th>Trạng Thái</th>
                    <th>Ngày</th>
                    <th>Quỹ</th>
                    <th>Loại</th>
                    <th>Số Tiền</th>
                    <th>Giá NAV</th>
                    <th>Số Lượng CCQ</th>
                    <th>Ghi Chú Lỗi</th>
                  </tr>
                </thead>
                <tbody>
                  {validatedRows.map((r) => (
                    <tr key={r.index} style={{ backgroundColor: r.isValid ? 'transparent' : 'rgba(255, 180, 171, 0.1)' }}>
                      <td>{r.index}</td>
                      <td>
                        <span className={r.isValid ? 'badge-positive' : 'badge-negative'}>
                          {r.isValid ? 'HỢP LỆ' : 'LỖI'}
                        </span>
                      </td>
                      <td>{r.date}</td>
                      <td style={{ fontWeight: 800, color: '#A8C7FA' }}>{r.fundCode}</td>
                      <td>{r.type}</td>
                      <td>{formatVND(r.amount)}</td>
                      <td>{formatVND(r.unitPrice)}</td>
                      <td>{r.units.toFixed(2)}</td>
                      <td style={{ color: '#FFB4AB', fontWeight: 600 }}>{r.errorReason || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

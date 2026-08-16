import { NextRequest, NextResponse } from 'next/server';

interface FmarketFundRow {
  id: number;
  shortName: string;
  code: string;
  name: string;
  nav: number;
  owner?: {
    shortName?: string;
    name?: string;
  };
  dataFundAssetType?: {
    code?: string;
    name?: string;
  };
  extra?: {
    lastNAVDate?: number;
    lastNAV?: number;
    currentNAV?: number;
  };
  productNavChange?: {
    navToPrevious?: number;
  };
}

export async function POST(req: NextRequest) {
  try {
    let requestedCodes: string[] = [];
    try {
      const body = await req.json();
      if (Array.isArray(body?.codes)) {
        requestedCodes = body.codes.map((c: string) => String(c).trim().toUpperCase());
      }
    } catch {
      // No body or invalid json, fetch all
    }

    const response = await fetch('https://api.fmarket.vn/res/products/filter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
      },
      body: JSON.stringify({
        types: ['NEW_FUND', 'TRADING_FUND'],
        page: 1,
        pageSize: 150,
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Fmarket API error: HTTP ${response.status}`);
    }

    const fmarketData = await response.json();
    const rows: FmarketFundRow[] = fmarketData?.data?.rows || [];

    const fundsMap: Record<
      string,
      {
        code: string;
        name: string;
        company: string;
        category: 'Equity' | 'Bond' | 'Balanced' | 'Index';
        nav: number;
        previousNav: number;
        navDate: string;
        changePercent: number;
      }
    > = {};

    rows.forEach((row) => {
      const code = (row.shortName || row.code || '').toUpperCase();
      if (!code) return;

      if (requestedCodes.length > 0 && !requestedCodes.includes(code)) {
        return;
      }

      let category: 'Equity' | 'Bond' | 'Balanced' | 'Index' = 'Equity';
      const assetCode = row.dataFundAssetType?.code?.toUpperCase();
      if (assetCode === 'BOND') category = 'Bond';
      else if (assetCode === 'BALANCED') category = 'Balanced';
      else if (assetCode === 'INDEX') category = 'Index';

      let navDate = new Date().toISOString().slice(0, 10);
      if (row.extra?.lastNAVDate) {
        navDate = new Date(row.extra.lastNAVDate).toISOString().slice(0, 10);
      }

      const currentNav = Number(row.nav || row.extra?.currentNAV || row.extra?.lastNAV || 0);
      let changePercent = 0;
      if (typeof row.productNavChange?.navToPrevious === 'number') {
        changePercent = row.productNavChange.navToPrevious;
      }

      // Calculate accurate previousNav based on Fmarket navToPrevious % change
      const previousNav = changePercent !== 0 && currentNav > 0
        ? currentNav / (1 + changePercent / 100)
        : Number(row.extra?.lastNAV || currentNav);

      fundsMap[code] = {
        code,
        name: row.name || code,
        company: row.owner?.shortName || row.owner?.name || 'Quỹ Việt Nam',
        category,
        nav: currentNav,
        previousNav,
        navDate,
        changePercent,
      };
    });

    return NextResponse.json({
      success: true,
      data: fundsMap,
      totalAvailable: rows.length,
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Auto-sync NAV error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Không thể tự động đồng bộ NAV từ nguồn Fmarket.',
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}

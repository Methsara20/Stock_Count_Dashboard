// const { poolPromise } = require('../config/db');

// const getDashboardSummary = async () => {
//   const pool = await poolPromise;

//   const result = await pool.request().query(`
//     SELECT 
//       SUM(available_qty) AS total_sih,
//       SUM(counted_qty) AS total_counted,
//       SUM(available_qty * unit_price) AS total_stock_value,
//       SUM(counted_qty - available_qty) AS total_variance_qty,
//       SUM((counted_qty - available_qty) * unit_price) AS total_variance_value
//     FROM your_joined_view_or_query
//   `);

//   return result.recordset[0];
// };

// const getDepartmentSummary = async () => {
//   const pool = await poolPromise;

//   const result = await pool.request().query(`
//     SELECT 
//       department,
//       SUM(available_qty) AS available,
//       SUM(counted_qty) AS counted,
//       SUM(counted_qty - available_qty) AS variance_qty,
//       SUM((counted_qty - available_qty) * unit_price) AS variance_value
//     FROM your_joined_view_or_query
//     GROUP BY department
//   `);

//   return result.recordset;
// };

// module.exports = {
//   getDashboardSummary,
//   getDepartmentSummary
// };


const { poolPromise } = require('../config/db');

const getDashboardSummary = async () => {
  const pool = await poolPromise;

  const result = await pool.request().query(`
    ;WITH sellable_lots AS (
  SELECT
      P.SKU_LOT,
      P.SKU_SIH,
      P.SKU_COST,
      P.SKU_SELL
  FROM dbo.M_TBLPRODUCTS_LOTS P
  WHERE ISNULL(P.SKU_SELL, 0) <> 0
),
scans AS (
  SELECT
      S.SC_SKULOTCODE,              -- If scans are at SKU level, replace with S.SC_SKUCODE (or your SKU column)
      SUM(ISNULL(S.SC_PHYQTY, 0)) AS total_scanned_qty
  FROM dbo.U_TBLSHELFSCAN S
  WHERE ISNULL(S.SC_CANCEL, 0) = 0
  GROUP BY S.SC_SKULOTCODE
),
joined AS (
  SELECT
      L.SKU_LOT,
      L.SKU_SIH,
      L.SKU_COST,
      COALESCE(S.total_scanned_qty, 0) AS total_scanned_qty
  FROM sellable_lots L
  LEFT JOIN scans S
    ON S.SC_SKULOTCODE = L.SKU_LOT   -- If scans are at SKU level, join by SKU instead
)
SELECT
    -- Totals
    CAST(SUM(L.SKU_SIH) AS DECIMAL(18, 3)) AS totalSystemStock,

    CAST((
      SELECT COALESCE(SUM(SC_PHYQTY), 0)
      FROM dbo.U_TBLSHELFSCAN
      WHERE ISNULL(SC_CANCEL, 0) = 0
    ) AS DECIMAL(18, 3)) AS totalScannedQty,

    -- Difference (Scanned - System)
    CAST((
      SELECT COALESCE(SUM(SC_PHYQTY), 0)
      FROM dbo.U_TBLSHELFSCAN
      WHERE ISNULL(SC_CANCEL, 0) = 0
    ) - COALESCE(SUM(L.SKU_SIH), 0) AS DECIMAL(18, 3)) AS difference,

    -- Coverage %
    CAST( CASE 
            WHEN COALESCE(SUM(L.SKU_SIH), 0) = 0 THEN NULL
            ELSE (
              (SELECT COALESCE(SUM(SC_PHYQTY), 0)
               FROM dbo.U_TBLSHELFSCAN
               WHERE ISNULL(SC_CANCEL, 0) = 0
              ) * 100.0 / COALESCE(SUM(L.SKU_SIH), 0)
            )
          END AS DECIMAL(10, 2)
    ) AS coveragePercent,

    -- Total Stock Value (align definition with your policy)
    CAST(SUM( ISNULL(L.SKU_SIH, 0) * ISNULL(L.SKU_COST, 0) ) AS DECIMAL(18, 5)) AS totalStockValue,

    -- Difference Value: (Scanned - System) * Cost at lot-level
    CAST(SUM( (J.total_scanned_qty - ISNULL(L.SKU_SIH, 0)) * ISNULL(L.SKU_COST, 0) ) AS DECIMAL(18, 5)) AS differenceValue

FROM sellable_lots L
LEFT JOIN joined J
  ON J.SKU_LOT = L.SKU_LOT;
  `);

  return result.recordset[0];
};

const getDepartmentSummary = async () => {
  const pool = await poolPromise;

  const result = await pool.request().query(`
    ;WITH P AS (
    SELECT SKU_CODE, SUM(COALESCE(SKU_SIH, 0)) AS available
    FROM M_TBLPRODUCTS_LOTS
    GROUP BY SKU_CODE
),
S AS (
    SELECT SC_PROCODE AS SKU_CODE, SUM(COALESCE(SC_PHYQTY, 0)) AS counted
    FROM U_TBLSHELFSCAN
    GROUP BY SC_PROCODE
),
SKU_BASE AS (
    SELECT
        PR.PLU_CODE                                 AS SKU_CODE,
        G.GP_DESC                                   AS department,
        COALESCE(PR.PLU_COST, 0)                    AS cost,
        COALESCE(P.available, 0)                    AS available,
        COALESCE(S.counted, 0)                      AS counted,
        -- Overages positive, shortages negative
        COALESCE(S.counted, 0) - COALESCE(P.available, 0) AS variance_qty
    FROM P
    INNER JOIN M_TBLPRODUCTS PR
        ON P.SKU_CODE = PR.PLU_CODE
       AND COALESCE(PR.PLU_SELL, 0) > 0
    LEFT JOIN M_TBLGROUP1  G  ON PR.PLU_GROUP1 = G.GP_CODE
    LEFT JOIN S               ON P.SKU_CODE = S.SKU_CODE
)
SELECT
    department,
    SUM(available)                                           AS available,
    SUM(counted)                                             AS counted,
    SUM(variance_qty)                                        AS variance_qty,
    -- Use ABS(cost) so the sign is driven only by variance_qty
    SUM(CAST(variance_qty AS DECIMAL(18,4)) 
        * CAST(ABS(cost) AS DECIMAL(18,4)))                  AS variance_value,
    CASE 
        WHEN SUM(available) = 0 THEN 0
        ELSE CAST(
            SUM(CAST(variance_qty AS DECIMAL(18,4))) 
            / NULLIF(SUM(CAST(available AS DECIMAL(18,4))), 0) * 100 
            AS DECIMAL(18,2)
        )
    END                                                      AS variance_percent
FROM SKU_BASE
GROUP BY department
ORDER BY department;
  `);

  return result.recordset;
};

module.exports = {
  getDashboardSummary,
  getDepartmentSummary
};

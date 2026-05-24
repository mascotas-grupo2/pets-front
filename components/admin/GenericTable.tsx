"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
  styled,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import { PriorityHigh } from "@mui/icons-material";

// --- Tipos ---
export type PageConfig = {
  size: number;
  index: number;
};

export interface TableColumn<T> {
  header: string;
  key: string;
  render?: (row: T) => React.ReactNode;
  align?: "left" | "center" | "right";
  width?: string | number;
}

interface GenericTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  totalCount: number;
  pageConfig: PageConfig;
  onPageChange: (config: PageConfig) => void;
  loading?: boolean;
  emptyMessage?: string;
}

// --- Componentes Estilizados (Custom) ---

export const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontSize: "0.85rem",
  padding: "16px",
  color: "#1e293b",
  borderBottom: "1px solid #f1f5f9",
}));

export const StyledHeaderCell = styled(TableCell)(({ theme }) => ({
  fontSize: "0.75rem",
  fontWeight: 700,
  color: "#94a3b8",
  textTransform: "uppercase",
  padding: "12px 16px",
  borderBottom: "none",
  backgroundColor: "#ffffff",
}));

export const StyledTableRow = styled(TableRow)(({ theme }) => ({
  transition: "background-color 0.2s ease",
  "&:hover": {
    backgroundColor: "#f8fafc",
  },
  "&:last-child td": {
    borderBottom: "none",
  },
}));

export function GenericTable<T>({
  columns,
  data,
  totalCount,
  pageConfig,
  onPageChange,
  loading = false,
  emptyMessage = "No se encontraron resultados",
}: GenericTableProps<T>) {

  const totalPages = Math.ceil(totalCount / pageConfig.size);

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    onPageChange({ ...pageConfig, index: value - 1 });
  };

  return (
    <Box sx={{ width: "100%" }}>
      <TableContainer component={Paper} sx={{
        boxShadow: "none",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        height: "450px",
        position: "relative",
        bgcolor: "#ffffff"
      }}>
        {loading && (
          <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "rgba(255,255,255,0.7)", zIndex: 2 }}>
            <CircularProgress size={32} sx={{ color: "#6366f1" }} />
          </Box>
        )}

        {data.length === 0 && !loading ? (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.5, color: '#94a3b8' }}>
            <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PriorityHigh fontSize="small" />
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>{emptyMessage}</Typography>
          </Box>
        ) : (
          <Table stickyHeader>
            <TableHead>
            <TableRow>
              {columns.map((col) => (
                  <StyledHeaderCell key={col.key} align={col.align} sx={{ width: col.width, bgcolor: '#ffffff' }}>
                  {col.header}
                </StyledHeaderCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
              {data.map((row, i) => (
                <StyledTableRow key={i}>
                  {columns.map((col) => (
                    <StyledTableCell key={col.key} align={col.align}>
                      {col.render ? col.render(row) : (row as any)[col.key]}
                    </StyledTableCell>
                  ))}
                </StyledTableRow>
              ))}
          </TableBody>
        </Table>
        )}
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 1 }}>
        <Pagination
          count={totalPages}
          page={pageConfig.index + 1}
          onChange={handlePageChange}
          shape="circular"
          color="primary"
          sx={{
            '& .MuiPaginationItem-root': { fontWeight: 600, fontSize: '0.85rem' }
          }}
        />
      </Box>
    </Box>
  );
}

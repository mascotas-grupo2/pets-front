  export const convertLocalMonthYear = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.toLocaleString("es-ES", { month: "long" }).toLowerCase();
    const year = date.getFullYear();
    return `${month} ${year}`;
  }
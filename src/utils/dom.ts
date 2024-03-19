export const copyText = async (text: string) => {
  try {
    navigator.clipboard.writeText(text);
  } catch (err: any) {
    console.error(err.name, err.message);
  }
};
export const GOOGLE_CLIENT_ID: string =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";
export const VERIFICA_AL_SERVIDOR: boolean =
  import.meta.env.VITE_VERIFICA_SERVIDOR === "si";
export const CLAU_SESSIO = "recurs-login-google/sessio";
if (!GOOGLE_CLIENT_ID) {
  console.error(
    "Falta VITE_GOOGLE_CLIENT_ID. Copia .env.example a .env i reinicia npm run dev. ",
  );
}

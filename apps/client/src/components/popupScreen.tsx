import Image from "next/image";
import { GrayButton, GreenButton, GreenIconButton } from "./buttons";
import { MdOutlineMail } from "react-icons/md";
import { GreenInput } from "./inputs";
import { FaLock } from "react-icons/fa";
import { popupType } from "@/lib/types";
import { httpApis } from "@/managers/http";
import { useState } from "react";
import { RegisterSchemaInput } from "@repo/types/types";
import { useRouter } from "next/navigation";
import { useWsContext } from "@/managers/ws";

interface PopupScreenProps {
  type: popupType;
  onClick: () => void;
  handleAuthState: (val: popupType) => void;
}

export const PopupScreen = ({
  type,
  onClick,
  handleAuthState,
}: PopupScreenProps) => {
  const router = useRouter();

  const [formdata, setFormdata] = useState<RegisterSchemaInput>({
    email: "",
    password: "",
  });

  const { setToken }  = useWsContext();
  
  const handleChange = (val: string, index: keyof RegisterSchemaInput) => {
    setFormdata((prev) => ({
      ...prev,
      [index]: val,
    }));
  };

  const handleAuth = () => {
    httpApis.register(formdata, (token, username, userId) => {
      localStorage.setItem("token", token);
      localStorage.setItem("username", username);
      localStorage.setItem("userId", userId);
      setToken(token)
      router.push("/home");
    });
  };

  return (
    <div
      onClick={onClick}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-center px-4"
    >
      {type === "play" && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md sm:max-w-lg
          rounded-3xl bg-neutral-800
          px-6 sm:px-10 py-8 sm:py-10"
        >
          <h1
            className="text-neutral-50 
            text-3xl sm:text-4xl md:text-5xl
            font-bebas font-bold uppercase text-center"
          >
            matiks on browser
          </h1>

          <p
            className="text-neutral-300 font-semibold 
            mt-4 text-xs sm:text-sm text-center font-nuni"
          >
            OUR BEST EXPERIENCE IS ON MOBILE
          </p>

          <div className="flex flex-col justify-center items-center gap-4 mt-8">
            <GreenButton
              label="GET STARTED"
              onClick={() => handleAuthState("signup-action")}
            />
            <GrayButton
              label="ALREADY HAVE AN ACCOUNT"
              onClick={() => handleAuthState("login-action")}
            />
          </div>
        </div>
      )}

      {type === "download" && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md sm:max-w-lg
          rounded-3xl bg-neutral-800
          px-6 sm:px-10 py-8 sm:py-10
          flex flex-col items-center gap-6"
        >
          <h1
            className="text-neutral-50 
            text-3xl sm:text-4xl md:text-5xl
            font-bebas font-bold uppercase text-center"
          >
            matiks on browser
          </h1>

          <Image
            src="/surprise-qr.png"
            alt="qr"
            width={200}
            height={200}
            className="w-40 sm:w-48 md:w-52 h-auto"
          />

          <p
            className="text-neutral-300 font-semibold 
            text-xs sm:text-sm text-center font-nuni uppercase"
          >
            Scan QR code with your phone camera
          </p>
        </div>
      )}

      {(type === "login-action" || type === "signup-action") && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md sm:max-w-lg
          rounded-3xl bg-neutral-800
          px-6 sm:px-10 py-8 sm:py-10
          flex flex-col items-center gap-6"
        >
          <div className="flex flex-col justify-center items-center gap-4 w-full">
            <h1
              className="text-neutral-50 
            text-3xl sm:text-4xl md:text-5xl
            font-bebas font-bold uppercase text-center"
            >
              {type === "login-action" ? "login" : "create account"}
            </h1>
          </div>

          <div className="flex flex-col justify-center items-center gap-4 w-full">
            <GreenInput
              value={formdata.email}
              onChange={(e) => handleChange(e.target.value, "email")}
              placeholder="Email"
              icon={<MdOutlineMail fill="#B1FA63" size={20} />}
            />
            <GreenInput
              value={formdata.password}
              onChange={(e) => handleChange(e.target.value, "password")}
              placeholder="Password"
              type="password"
              icon={<FaLock fill="#B1FA63" size={20} />}
            />
          </div>

          <GrayButton label="Submit" onClick={handleAuth} />
        </div>
      )}
    </div>
  );
};

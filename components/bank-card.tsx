import Image from "next/image";

type Props = {
  account: string;
  showBalance: boolean;
};

export default function BankCard({ account, showBalance }: Props) {
  return (
    <div className="flex flex-col">
      <div className="relative flex h-[190px] w-full max-w-[320px] justify-between rounded-[20px] border bg-gradient-to-r from-[#0179FE] to-[#4893FF] shadow-lg backdrop-blur-[6px]">
        <div className="relative z-10 flex size-full max-w-[228px] flex-col justify-between rounded-l-[20px] bg-gray-700 bg-gradient-to-r from-[#0179FE] to-[#4893FF] px-5 pb-4 pt-5">
          <div>
            <h1 className="text-16 font-semibold text-white">{account}</h1>
            <p className="font-ibm-plex-sherif font-black text-white">
              {showBalance ? "$1,000.00" : "No balance"}
            </p>
          </div>
          <article className="flex flex-col gap-2">
            <div className="flex justify-between">
              <h1 className="text-12 font-semibold text-white">
                Miguel Fortes
              </h1>
              <h2 className="text-12 font-semibold text-white">●● / ●●</h2>
            </div>
            <p className="text-14 whitespace-nowrap font-semibold tracking-[1.1px] text-white">
              ●●●● ●●●● ●●●● <span className="text-16">1234</span>
            </p>
          </article>
        </div>
        <div className="flex size-full flex-1 flex-col items-end justify-between rounded-r-[20px] bg-gradient-to-r from-[#0179FE] to-[#4893FF] bg-cover bg-center bg-no-repeat py-5 pr-5">
          <Image src="/icons/paypass.svg" width={20} height={24} alt="pay" />
          <Image
            src="/icons/mastercard.svg"
            width={45}
            height={32}
            alt="mastercard"
            className="ml-5"
          />
        </div>
        <Image
          src="/icons/lines.svg"
          width={316}
          height={190}
          alt="lines"
          className="absolute left-0 top-0"
        />
      </div>
    </div>
  );
}

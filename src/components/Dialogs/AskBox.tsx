import { dialogs } from "@/lib/signals";
import { classNames, wait } from "@/lib/utils";
import { signal } from "@preact/signals-core";
import { useSignals } from "@preact/signals-react/runtime";

type buttonOption = {
  name: string;
  value: number;
  colour: "green" | "blue" | "red";
};

type AskBoxProps = {
  title: string;
  contect: string;
  options: buttonOption[];
};

const askBoxProps = signal<AskBoxProps>({
  title: "Reloaded",
  contect: "The Component is Hotloaded.",
  options: [{ name: "Go Back", value: 0, colour: "blue" }],
});

let optionValue: null | buttonOption["value"];

export default function AskBoxDialog() {
  useSignals();

  function handleOnButtonPress(_optionValue: buttonOption["value"]) {
    optionValue = _optionValue;
    setTimeout(() => (dialogs.askBox.value = false), 100);
  }

  const { title, contect, options } = askBoxProps.value;

  return (
    <div className="absolute flex h-full w-full items-center justify-center bg-transparent backdrop-blur-sm">
      <div className="max-h-96 min-h-44 w-72 overflow-clip rounded-2xl bg-neutral-800 pt-3 shadow-xl">
        <h2 className="mb-2.5 min-h-8 px-5 text-xl font-bold">{title}</h2>

        <div className="mb-4 min-h-16 px-5 leading-tight text-white/85">
          {contect}
        </div>

        <div className="grid grid-flow-col grid-cols-subgrid border-t border-white/5 font-bold">
          {options.map((option, idx, arr) => (
            <button
              key={`option-${idx}`}
              className={classNames(
                "w-full px-3 py-2",
                option.colour == "blue" &&
                  "text-blue-700 hover:bg-blue-800/10 hover:text-blue-600",
                option.colour == "green" &&
                  "text-green-700 hover:bg-green-800/10 hover:text-green-600",
                option.colour == "red" &&
                  "text-red-700 hover:bg-red-800/10 hover:text-red-600",
                idx + 1 < arr.length && "border-r border-white/10",
              )}
              onClick={() => handleOnButtonPress(option.value)}
            >
              {option.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export async function openAskBox(props: AskBoxProps) {
  askBoxProps.value = props;
  optionValue = null;
  dialogs.askBox.value = true;

  let value: number;
  while (true) {
    await wait(300);
    if (optionValue != null) {
      value = optionValue;
      optionValue = null;
      break;
    }
  }

  return value;
}

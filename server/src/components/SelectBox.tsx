import React, { useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { classNames } from "@/lib/utils";

import { RiCodeView } from "react-icons/ri";
import { BsCheck2 } from "react-icons/bs";
import { Template } from "@/lib/options/templates";
import { Language, sorts } from "@/lib/options";

type Props<T = null | Template | Language | (typeof sorts)[0]> = {
  label: string;
  options: T[];
  initialOption: T;
  onChange: (option: T) => void;
};

export default function SelectBox({
  label,
  options,
  initialOption,
  onChange,
}: Props) {
  const [selectedOption, setSelectedOption] = useState(initialOption);

  function _onChange(newOption: typeof initialOption) {
    setSelectedOption(newOption);
    onChange(newOption);
  }

  return (
    <Listbox value={selectedOption} onChange={_onChange}>
      {({ open }) => {
        const SelectedOption_icon =
          selectedOption &&
          "icon" in selectedOption &&
          !!selectedOption.icon &&
          selectedOption.icon;

        const SelectedOption_Icon =
          selectedOption &&
          "Icon" in selectedOption &&
          !!selectedOption.Icon &&
          selectedOption.Icon;

        return (
          <>
            <Listbox.Label className="-mb-1 block text-sm font-medium leading-6 text-gray-300">
              {label}
            </Listbox.Label>

            <div className="relative">
              <Listbox.Button className="relative w-full cursor-default rounded-md bg-neutral-800 py-1 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-neutral-800/85 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm sm:leading-6">
                <span className="flex items-center">
                  {!!selectedOption && (
                    <>
                      {SelectedOption_icon && (
                        <SelectedOption_icon
                          key={selectedOption.name}
                          className="h-5 w-5 flex-shrink-0"
                        />
                      )}

                      {SelectedOption_Icon &&
                        SelectedOption_Icon({ key: selectedOption.name })}
                    </>
                  )}

                  <span
                    className={classNames(
                      !!(SelectedOption_icon || SelectedOption_Icon) && "ml-3",
                      "block truncate text-gray-200"
                    )}
                  >
                    {!!selectedOption
                      ? !!selectedOption.displayName
                        ? selectedOption.displayName
                        : selectedOption.name
                      : "None"}
                  </span>
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                  <RiCodeView
                    className="h-3.5 w-3.5 rotate-90 text-gray-400"
                    aria-hidden="true"
                  />
                </span>
              </Listbox.Button>

              <Transition
                show={open}
                as={React.Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="scrollbar-hide absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-neutral-800 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {options.map((option, idx) => {
                    const CurrentOption_icon =
                      option &&
                      "icon" in option &&
                      !!option.icon &&
                      option.icon;

                    const CurrentOption_Icon =
                      option &&
                      "Icon" in option &&
                      !!option.Icon &&
                      option.Icon;

                    return (
                      <Listbox.Option
                        key={idx}
                        className={({ active }) =>
                          classNames(
                            active && "bg-[#222]",
                            "relative cursor-default select-none py-1.5 pl-3 pr-9 text-gray-200"
                          )
                        }
                        value={option}
                      >
                        {({ selected, active }) => (
                          <>
                            <div className="flex items-center">
                              {!!option && (
                                <span className="text-gray-900">
                                  {CurrentOption_icon && (
                                    <CurrentOption_icon
                                      key={option.name}
                                      className="h-5 w-5 flex-shrink-0"
                                    />
                                  )}

                                  {CurrentOption_Icon &&
                                    CurrentOption_Icon({ key: option.name })}
                                </span>
                              )}

                              <span
                                className={classNames(
                                  selected ? "font-semibold" : "font-normal",
                                  "ml-3 block truncate"
                                )}
                              >
                                {!!option
                                  ? !!option.displayName
                                    ? option.displayName
                                    : option.name
                                  : "None"}
                              </span>
                            </div>

                            {selected && (
                              <span
                                className={classNames(
                                  active ? "text-white" : "text-indigo-600",
                                  "absolute inset-y-0 right-0 flex items-center pr-4"
                                )}
                              >
                                <BsCheck2
                                  className="h-5 w-5"
                                  aria-hidden="true"
                                />
                              </span>
                            )}
                          </>
                        )}
                      </Listbox.Option>
                    );
                  })}
                </Listbox.Options>
              </Transition>
            </div>
          </>
        );
      }}
    </Listbox>
  );
}

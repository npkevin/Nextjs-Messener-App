import { Dispatch, MouseEventHandler, SetStateAction } from "react";

interface TextProps<T> {
    type?: string;
    placeholder: string;
    className?: string;
    state: [T, Dispatch<SetStateAction<T>>];
}

export const TextInput: React.FC<TextProps<string>> = ({
    className,
    type,
    placeholder,
    state,
}) => {
    const defaultStyle =
        "mt-4 px-4 py-1 rounded-lg text-gray-700 drop-shadow focus:outline-none";
    const style = !className ? defaultStyle : className;
    const [value, setValue] = state;
    return (
        <input
            className={style}
            type={!type ? "text" : type}
            placeholder={placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
        />
    );
};

interface ButtonProps {
    className?: string;
    value: string;
    disabled?: boolean;
    onClick: MouseEventHandler<HTMLInputElement>;
}

export const Button: React.FC<ButtonProps> = ({
    className,
    value,
    disabled,
    onClick,
}) => {
    const defaultStyle =
        "w-32 mt-4 p-1 rounded-lg drop-shadow cursor-pointer bg-blue-300 hover:bg-blue-400";
    const style = !className ? defaultStyle : className;
    return (
        <input
            className={style}
            type="button"
            value={value}
            disabled={!!disabled}
            onClick={onClick}
        />
    );
};

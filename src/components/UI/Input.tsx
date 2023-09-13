import { Dispatch, MouseEventHandler, SetStateAction } from "react";
import { IconType } from "react-icons";

interface TextProps<T> {
    type?: string;
    placeholder: string;
    className?: string;
    state: [T, Dispatch<SetStateAction<T>>];
    disabled?: boolean;
}

export const TextInput: React.FC<TextProps<string>> = ({
    className,
    type,
    placeholder,
    state,
    disabled,
}) => {
    const [value, setValue] = state;
    className =
        "text-sm px-4 py-1 rounded drop-shadow text-gray-700 bg-white focus:outline-none " +
        "disabled:bg-slate-300 " +
        className;
    return (
        <input
            className={className}
            type={!type ? "text" : type}
            placeholder={placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={!!disabled}
        />
    );
};

interface ButtonProps {
    className?: string;
    value: string;
    disabled?: boolean;
    onClick: MouseEventHandler<HTMLInputElement>;
}

export const Button: React.FC<ButtonProps> = ({ className, value, disabled, onClick }) => {
    className =
        "text-sm p-1 rounded drop-shadow enabled:hover:cursor-pointer bg-slate-400 enabled:hover:bg-slate-500 " +
        "disabled:bg-slate-100 disabled:text-slate-300 " +
        "transition " +
        className;

    return (
        <input
            className={className}
            type="button"
            value={value}
            disabled={!!disabled}
            onClick={onClick}
        />
    );
};

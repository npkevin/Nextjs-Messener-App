import { Dispatch, MouseEventHandler, SetStateAction } from "react";

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
    className = `px-4 py-1 rounded-lg text-gray-700 bg-white drop-shadow focus:outline-none disabled:bg-slate-300 ${className}`;
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

export const Button: React.FC<ButtonProps> = ({
    className,
    value,
    disabled,
    onClick,
}) => {
    className = `p-1 rounded-lg drop-shadow bg-slate-400 enabled:hover:bg-slate-500 enabled:cursor-pointer disabled:bg-slate-100 disabled:text-slate-300 ${className}`;
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

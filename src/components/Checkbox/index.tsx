import { ChangeEvent } from 'react'

import styles from './styles.module.scss'

interface CheckboxProps {
    label: string,
    checked: boolean | undefined,
    onChange: (checked: boolean) => void
}

export function Checkbox({ label, checked, onChange }: CheckboxProps) {

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => onChange(e.target.checked)

    return(
        <label className={styles.labelContainer}>
            <input type='checkbox' checked={checked} onChange={handleChange} />
            {label}
        </label>
    )
}
import setup from '../database';

const pool = setup();

interface Setting {
  setting_key: string;
  setting_value: any; // Value can be of any type, will be stored as string
}

export const getSetting = async (key: string): Promise<string | undefined> => {
  const { rows } = await pool.query(
    'SELECT setting_value FROM settings WHERE setting_key = $1',
    [key],
  );
  return rows[0] ? rows[0].setting_value : undefined;
};

export const setSetting = async (key: string, value: any): Promise<boolean> => {
  const valueAsString = typeof value === 'string' ? value : JSON.stringify(value);
  const result = await pool.query(
    `
    INSERT INTO settings (setting_key, setting_value)
    VALUES ($1, $2)
    ON CONFLICT (setting_key)
    DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = NOW()
  `,
    [key, valueAsString],
  );
  return (result.rowCount ?? 0) > 0;
};

export const getAllSettings = async (): Promise<Record<string, any>> => {
  const { rows } = await pool.query(
    'SELECT setting_key, setting_value FROM settings',
  );
  
  // Transform the array of settings into a key-value object
  const settingsObj = rows.reduce((acc, setting) => {
    try {
      // Attempt to parse the value if it's a JSON string
      acc[setting.setting_key] = JSON.parse(setting.setting_value);
    } catch (e) {
      // If parsing fails, use the raw string value
      acc[setting.setting_key] = setting.setting_value;
    }
    return acc;
  }, {} as Record<string, any>);

  return settingsObj;
};
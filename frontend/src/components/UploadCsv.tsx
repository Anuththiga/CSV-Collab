import { useState } from 'react';

import { uploadCsv } from '../services/csv.services';

interface UploadCsvProps {
    onUploadComplete: () => void;
}

const UploadCsv = ({
    onUploadComplete,
}: UploadCsvProps) => {
    const [file, setFile] = useState<File | null>(null);

    const [progress, setProgress] = useState(0);

    const [uploading, setUploading] = useState(false);

    const [message, setMessage] = useState('');

    const [error, setError] = useState('');

    const handleFileChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const selectedFile = event.target.files?.[0];

        setMessage('');
        setError('');
        setProgress(0);

        if (!selectedFile) {
            setFile(null);
            return;
        }

        if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
            setFile(null);
            setError('Please select a CSV file.');
            return;
        }

        setFile(selectedFile);
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a CSV file.');
            return;
        }

        try {
            setUploading(true);
            setProgress(0);
            setMessage('');
            setError('');

            const response = await uploadCsv(
                file,
                setProgress
            );

            setMessage(response.message);

            setFile(null);

            onUploadComplete();
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Upload failed'
            );
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="upload-container">
            <h2>Upload CSV</h2>

            <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                disabled={uploading}
            />

            {file && (
                <p>
                    Selected file: <strong>{file.name}</strong>
                </p>
            )}

            <button
                onClick={handleUpload}
                disabled={!file || uploading}
            >
                {uploading ? 'Uploading...' : 'Upload'}
            </button>

            {uploading && (
                <div className="progress-container">
                    <div className="progress-bar">
                        <div
                            className="progress"
                            style={{
                                width: `${progress}%`,
                            }}
                        />
                    </div>

                    <span>{progress}%</span>
                </div>
            )}

            {message && (
                <p className="success">
                    ✓ {message}
                </p>
            )}

            {error && (
                <p className="error">
                    {error}
                </p>
            )}
        </div>
    );
};

export default UploadCsv;
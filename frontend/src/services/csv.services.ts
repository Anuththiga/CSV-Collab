export const uploadCsv = (
    file: File,
    onProgress: (progress: number) => void
): Promise<{ message: string }> => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.open(
            'POST',
            'http://localhost:8080/api/csv/upload'
        );

        xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
                const progress = Math.round(
                    (event.loaded / event.total) * 100
                );

                onProgress(progress);
            }
        });

        xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(JSON.parse(xhr.responseText));
            } else {
                try {
                    const error = JSON.parse(xhr.responseText);

                    reject(
                        new Error(
                            error.message || 'Upload failed'
                        )
                    );
                } catch {
                    reject(new Error('Upload failed'));
                }
            }
        });

        xhr.addEventListener('error', () => {
            reject(new Error('Network error while uploading file'));
        });

        const formData = new FormData();

        formData.append('file', file);

        xhr.send(formData);
    });
};
import type { ConflictData } from '../services/post.services';

interface ConflictModalProps {
    conflict: ConflictData;
    onKeepCurrent: () => void;
    onKeepMine: () => void;
    onCancel: () => void;
}

const ConflictModal = ({
    conflict,
    onKeepCurrent,
    onKeepMine,
    onCancel,
}: ConflictModalProps) => {
    const {
        current,
        requested,
    } = conflict;

    return (
        <div className="modal-overlay">
            <div className="conflict-modal">

                <h2>
                    Conflict Detected
                </h2>

                <p>
                    This record was changed by
                    another user before you saved.
                </p>

                <div className="conflict-columns">

                    <div className="conflict-section">
                        <h3>
                            Current Version
                        </h3>

                        <p>
                            <strong>Name:</strong>{' '}
                            {current.name}
                        </p>

                        <p>
                            <strong>Email:</strong>{' '}
                            {current.email}
                        </p>

                        <p>
                            <strong>Version:</strong>{' '}
                            {current.version}
                        </p>

                        <p>
                            <strong>Updated By:</strong>{' '}
                            {current.updatedBy}
                        </p>
                    </div>


                    <div className="conflict-section">
                        <h3>
                            Your Changes
                        </h3>

                        <p>
                            <strong>Name:</strong>{' '}
                            {requested.name}
                        </p>

                        <p>
                            <strong>Email:</strong>{' '}
                            {requested.email}
                        </p>

                        <p>
                            <strong>Version:</strong>{' '}
                            {requested.version}
                        </p>
                    </div>

                </div>


                <div className="conflict-actions">

                    <button
                        type="button"
                        onClick={onKeepCurrent}
                    >
                        Keep Current
                    </button>

                    <button
                        type="button"
                        onClick={onKeepMine}
                    >
                        Keep My Changes
                    </button>

                    <button
                        type="button"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>

                </div>

            </div>
        </div>
    );
};

export default ConflictModal;
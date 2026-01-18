import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import {Poll, PollOption} from "../../types/polls";

interface CreatePollModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreatePoll:  (poll: Omit<Poll, 'id'>) => void;
    classroomId: string;
    currentUserId: string;
}

export default function CreatePollModal({ isOpen, onClose, onCreatePoll, classroomId, currentUserId }: CreatePollModalProps) {
    const [question, setQuestion] = useState("");
    const [options, setOptions] = useState<string[]>(["", ""]);
    const [allowMultipleAnswers, setAllowMultipleAnswers] = useState(false);
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [showResultsLive, setShowResultsLive] = useState(true);

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleAddOption = () => {
        if(options.length >= 10){
            return;
        }
        setOptions([...options, ""]);
    };

    const handleRemoveOption = (index: number) => {
        if(options.length <= 2){
            return;
        }
        setOptions(options.filter((_, i) => i !== index));
    };

    const canSubmit = 
        question.trim().length > 0 &&
        options.filter(opt => opt.trim().length > 0).length >= 2 &&
        options.every(opt => opt.trim().length > 0);

        const handleCreate = () => {
            if(!canSubmit){
                return;
            }

            const pollData: Omit<Poll, 'id'> = {
                classroomId,
                question: question.trim(),
                options: options.map((text,index) => ({
                    id: `option-${Date.now()}-${index}`,
                    text: text.trim(),
                    voteCount: 0
                })),
                createdAt: Date.now(),
                createdBy: currentUserId,
                allowMultipleAnswers: allowMultipleAnswers,
                isAnonymous,
                showResultsLive: showResultsLive,
                isActive: true
            };

            onCreatePoll(pollData);
            handleClose();
        };

    const handleClose = () => {
        setQuestion("");
        setOptions(["", ""]);
        setAllowMultipleAnswers(false);
        setIsAnonymous(true);
        setShowResultsLive(true);
        onClose();
    };
    if(!isOpen){
        return null;
    }

    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Create Poll</h2>
            <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">    
                <X size={24} />
            </button>
        </div>
        {/* Body */}
        <div className="p-6 space-y-6">
            {/* Question Input */  }
            <div>
                  <label className="block text-sm font-medium mb-2">Question</label>
            <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                 placeholder="Enter your question..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={200}
            />
          </div>

            {/* Options Inputs */}
            <div>
                 <label className="block text-sm font-medium mb-2">Options</label>
            <div className="space-y-2">
                {options.map((option, index) => (
                     <div key={index} className="flex gap-2">
                  <span className="flex items-center justify-center w-8 text-sm text-gray-600">
                    {index + 1}.
                  </span>
                    <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    maxLength={100}
                  />
                    {options.length > 2 && (
                    <button
                        onClick={() => handleRemoveOption(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                        <Trash2 size={16} />
                    </button>
                  )}
                </div>
                ))}

            </div>

            {/* Add Option Button */}
            {options.length < 10 && (
                <button
                    onClick={handleAddOption}
                      className="mt-3 flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                    <Plus size={20} />
                    Add Option  
              </button>
            )}
            </div>
            {/* Settings checkboxes */}
            <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        checked = {isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="w-4 h-4"
                    />
                     <span className="text-sm">Anonymous (hide voter names)</span>
            </label>

            <label className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        checked = {allowMultipleAnswers}
                        onChange={(e) => setAllowMultipleAnswers(e.target.checked)}
                        className="w-4 h-4"
                    />
                     <span className="text-sm">Allow multiple answers</span>
            </label>

            <label className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        checked = {showResultsLive}
                        onChange={(e) => setShowResultsLive(e.target.checked)}
                        className="w-4 h-4"
                    />
                        <span className="text-sm">Show results live</span>
            </label>
            </div>
        </div>
        {/* Footer */}

 <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!canSubmit}
            className={`px-6 py-2 rounded-lg ${
              canSubmit
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Create Poll
          </button>
        </div>
      </div>
    </div>
  );
}
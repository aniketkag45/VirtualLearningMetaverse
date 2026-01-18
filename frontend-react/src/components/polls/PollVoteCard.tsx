import {useState} from 'react';
import {CheckCircle} from 'lucide-react';
import { Poll } from '../../types/polls';

interface PollVoteCardProps {
    poll: Poll;
    onSubmitVote: (pollId: string, selectedOptionIds: string[]) => void;
    hasVoted: boolean;
}

export default function PollVoteCard({poll, onSubmitVote, hasVoted}: PollVoteCardProps) {

    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

    const handleOptionSelect = (optionId: string) => {
        if(hasVoted || !poll.isActive) {
            return;
        }

        if(poll.allowMultipleAnswers) {
            setSelectedOptions(prev =>
                prev.includes(optionId)
                    ? prev.filter(id => id !== optionId)
                    : [...prev, optionId]
            );
        }
        else {
            setSelectedOptions([optionId]);
        }
    };

    const handleSubmit = () => {
        if(selectedOptions.length === 0) {
            alert("Please select at least one option before submitting.");
            return;
        }

        onSubmitVote(poll.id, selectedOptions);

    };

    if(hasVoted) {
        const votedOptions = poll.options.filter(opt => selectedOptions.includes(opt.id));
        return (
             <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="text-green-600 mt-1" size={20} />
          <div>
            <p className="font-medium text-green-900">Vote Submitted</p>
            <p className="text-sm text-green-700">
              Your answer: {votedOptions.map(o => o.text).join(', ')}
            </p>
            <p className="text-xs text-green-600 mt-1">
              {poll.isActive ? 'Waiting for results...' : 'Poll closed'}
            </p>
          </div>
        </div>
      </div>
    );
  }

    return (
         <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      {/* Question */}
      <h3 className="text-lg font-semibold mb-4">{poll.question}</h3>
      
      {/* Options */}
      <div className="space-y-2 mb-4">
        {poll.options.map((option) => {
          const isSelected = selectedOptions.includes(option.id);
          
          return (
            <button
              key={option.id}
              onClick={() => handleOptionSelect(option.id)}
              disabled={!poll.isActive}
              className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
              } ${!poll.isActive ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
                 <div className="flex items-center gap-3">
                {/* Checkbox or Radio visual */}
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  poll.allowMultipleAnswers ? '' : 'rounded-full'
                } ${
                  isSelected 
                    ? 'bg-blue-500 border-blue-500' 
                    : 'border-gray-400'
                }`}>
                  {isSelected && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
                
                <span className="flex-1">{option.text}</span>
              </div>
            </button>
          );
        })}
      </div>
       {/* Submit Button */}
      {poll.isActive && (
        <button
          onClick={handleSubmit}
          disabled={selectedOptions.length === 0}
          className={`w-full py-2 rounded-lg font-medium ${
            selectedOptions.length > 0
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          Submit Vote
        </button>
      )}
      
      {!poll.isActive && (
        <p className="text-center text-sm text-gray-500">Poll is closed</p>
      )}
    </div>
  );}
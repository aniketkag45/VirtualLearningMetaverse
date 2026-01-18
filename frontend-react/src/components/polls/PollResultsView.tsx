import { Poll } from "../../types/polls";
import { XCircle } from "lucide-react";

interface PollResultsViewProps {
    poll: Poll;
    onClosePoll ?: (pollId: string) => void;
    isTeacher: boolean;
}

export default function PollResultsView({ poll, onClosePoll, isTeacher }: PollResultsViewProps) {

    const totalVotes = poll.options.reduce((sum, option) => sum + option.voteCount, 0); 

    const sortedOptions = [...poll.options].sort((a, b) => b.voteCount - a.voteCount);

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold">{poll.question}</h3>
        <p className="text-sm text-gray-600">
          Total Responses: {totalVotes}
          {poll.isActive && <span className="ml-2 text-green-600">● Live</span>}
        </p>
      </div>

       {/* Results Bars */}
      <div className="space-y-4">
        {sortedOptions.map((option, index) => {
          const percentage = totalVotes > 0 
            ? Math.round((option.voteCount / totalVotes) * 100) 
            : 0;
             return (
            <div key={option.id}>
              {/* Label */}
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">{option.text}</span>
                <span className="text-sm text-gray-600">
                  {option.voteCount} {option.voteCount === 1 ? 'vote' : 'votes'} ({percentage}%)
                </span>
              </div>

               {/* Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: `hsl(${210 - index * 30}, 70%, 50%)` // Color gradient
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      {/* No votes message */}
      {totalVotes === 0 && (
        <p className="text-center text-gray-500 text-sm mt-4">
          No votes yet
        </p>
      )}
      {/* Close Poll Button (Teacher Only) */}
      {isTeacher && poll.isActive && onClosePoll && (
        <button
          onClick={() => onClosePoll(poll.id)}
          className="mt-4 w-full flex items-center justify-center gap-2 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          <XCircle size={20} />
          Close Poll
        </button>
      )}
    </div>
  );
}
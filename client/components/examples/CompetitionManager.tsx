import { useState } from 'react';
import { 
  useCompetitions, 
  useCreateCompetition, 
  useUpdateCompetition,
  useDeleteCompetition,
  useRegisterForCompetition,
  useMyRegistrations
} from '@/hooks/useCompetitions';

export function CompetitionManager() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Queries
  const { data: competitions, isLoading, error } = useCompetitions();
  const { data: myRegistrations } = useMyRegistrations();

  // Mutations
  const createMutation = useCreateCompetition();
  const updateMutation = useUpdateCompetition();
  const deleteMutation = useDeleteCompetition();
  const registerMutation = useRegisterForCompetition();

  // Create competition handler
  const handleCreate = async (formData: FormData) => {
    const data = {
      name: formData.get('name') as string,
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      location: formData.get('location') as string,
      description: formData.get('description') as string,
    };

    try {
      await createMutation.mutateAsync(data);
      setIsCreating(false);
    } catch (error) {
      // Error handling is done in the mutation's onError
    }
  };

  // Update competition handler
  const handleUpdate = async (id: string, formData: FormData) => {
    const data = {
      id,
      name: formData.get('name') as string,
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      location: formData.get('location') as string,
      description: formData.get('description') as string,
    };

    try {
      await updateMutation.mutateAsync(data);
      setEditingId(null);
    } catch (error) {
      // Error handling is done in the mutation's onError
    }
  };

  // Delete competition handler
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this competition?')) {
      try {
        await deleteMutation.mutateAsync({ id });
      } catch (error) {
        // Error handling is done in the mutation's onError
      }
    }
  };

  // Register for competition handler
  const handleRegister = async (competitionId: string) => {
    try {
      await registerMutation.mutateAsync({
        competitionId,
        userId: 'current-user-id', // This would come from auth context
      });
      alert('Successfully registered!');
    } catch (error) {
      // Error handling is done in the mutation's onError
    }
  };

  if (isLoading) return <div>Loading competitions...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Competition Manager</h1>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? 'Creating...' : 'Create Competition'}
        </button>
      </div>

      {/* Create Form */}
      {isCreating && (
        <form action={handleCreate} className="bg-gray-100 p-4 rounded space-y-4">
          <h2 className="text-lg font-semibold">Create New Competition</h2>
          <input
            name="name"
            placeholder="Competition Name"
            required
            className="w-full p-2 border rounded"
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              name="startDate"
              type="datetime-local"
              required
              className="p-2 border rounded"
            />
            <input
              name="endDate"
              type="datetime-local"
              required
              className="p-2 border rounded"
            />
          </div>
          <input
            name="location"
            placeholder="Location (optional)"
            className="w-full p-2 border rounded"
          />
          <textarea
            name="description"
            placeholder="Description (optional)"
            className="w-full p-2 border rounded"
            rows={3}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Creating...' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* My Registrations */}
      {myRegistrations && myRegistrations.length > 0 && (
        <div className="bg-blue-50 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">My Registrations</h2>
          <ul className="space-y-1">
            {myRegistrations.map(reg => (
              <li key={reg.id} className="text-sm">
                Registered for competition: {reg.competitionId}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Competitions List */}
      <div className="space-y-4">
        {competitions?.map(competition => (
          <div key={competition.id} className="border p-4 rounded">
            {editingId === competition.id ? (
              // Edit Form
              <form action={(formData) => handleUpdate(competition.id, formData)} className="space-y-4">
                <input
                  name="name"
                  defaultValue={competition.name}
                  required
                  className="w-full p-2 border rounded"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    name="startDate"
                    type="datetime-local"
                    defaultValue={new Date(competition.startDate).toISOString().slice(0, 16)}
                    required
                    className="p-2 border rounded"
                  />
                  <input
                    name="endDate"
                    type="datetime-local"
                    defaultValue={new Date(competition.endDate).toISOString().slice(0, 16)}
                    required
                    className="p-2 border rounded"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 disabled:opacity-50"
                  >
                    {updateMutation.isPending ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              // Display View
              <div>
                <h3 className="text-xl font-semibold">{competition.name}</h3>
                <p className="text-gray-600">
                  {new Date(competition.startDate).toLocaleDateString()} - 
                  {new Date(competition.endDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500 mb-4">{competition.events.length} events</p>
                
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => handleRegister(competition.id)}
                    disabled={registerMutation.isPending}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    {registerMutation.isPending ? 'Registering...' : 'Register'}
                  </button>
                  
                  <button
                    onClick={() => setEditingId(competition.id)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  
                  <button
                    onClick={() => handleDelete(competition.id)}
                    disabled={deleteMutation.isPending}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:opacity-50"
                  >
                    {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
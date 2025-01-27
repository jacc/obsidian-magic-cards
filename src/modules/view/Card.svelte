<script lang="ts">
    import { Notice, type App, type TFile } from 'obsidian';
    import { generateFlashcards } from '../api';

    export let app: App;

    let selectedOption = 'deepseek-chat';
    let userContext = '';

    const options = [
        { value: 'deepseek-chat', label: 'Deepseek' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' }
    ];

    let isGenerating = false;
    let generatedCards: Array<{front: string, back:string}> = [];

    async function handleGenerate() {
        isGenerating = true;
        generatedCards = [];
        
        try {
            const fileContent = await app.vault.read(app.workspace.getActiveFile()!);
            await generateFlashcards(
                fileContent, 
                userContext,
                (card) => {
                    generatedCards = [...generatedCards, {
                        front: card.front,
                        back: card.back,
                    }];
                }
            );
        } catch (error) {
            console.error('Error generating flashcards:', error);
        } finally {
            isGenerating = false;
        }
    }

    async function addToNote(front: string, back: string) {
        const activeFile = app.workspace.getActiveFile();
        if (!activeFile) return;

        const content = await app.vault.read(activeFile);
        const newContent = `${content}\n\n## Flashcard\n**Q:** ${front}\n**A:** ${back}`;
        
        await app.vault.modify(activeFile, newContent);
        new Notice('Flashcard added to note');
    }

    function discardCard(index: number) {
        generatedCards = generatedCards.filter((_, i) => i !== index);
    }
</script>

<div class="flex flex-col gap-4 p-4 max-w-2xl mx-auto">
    <!-- Header section -->
    <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
            <button disabled class="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center pointer-events-none">
                📄 <span class="ml-1">{app.workspace.getActiveFile()?.name || ""}</span>
            </button>
        </div>
        
        <div class="flex items-center gap-3">
            <select 
                bind:value={selectedOption}
                class="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
                {#each options as option}
                    <option value={option.value}>{option.label}</option>
                {/each}
            </select>
        </div>
    </div>

    <div class="space-y-2 flex gap-2">
        <div class="mb-1 flex-1">
            <input
                type="text"
                placeholder="Specify some information..."
                class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                bind:value={userContext}
            />
        </div>
         <button 
                class="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                on:click={handleGenerate}
                disabled={isGenerating}
            >
                {#if isGenerating}
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                {/if}
                Generate
            </button>
    </div>

    <!-- Cards section -->
    <div class="space-y-1">
        {#if generatedCards.length === 0 && !isGenerating}
            <div class="rounded-lg text-center text-gray-500 dark:text-gray-400">
                Click generate to create cards with 💫 magic 🪄
            </div>
        {/if}

        {#each generatedCards as card, i}
            <div class="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div class="space-y-6">
                        <p class="text-bold text-gray-700 dark:text-gray-300">{card.front}</p>
                        <hr class="my-1 border-t border-gray-200 dark:border-gray-700" />
                        <p class="text-gray-600 dark:text-gray-400">{card.back}</p>
                        <div class="flex gap-2">
                            <button 
                                class="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                                on:click={() => addToNote(card.front, card.back)}
                            >
                                Add to note
                            </button>
                            <button 
                                class="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                on:click={() => discardCard(i)}
                            >
                                Discard
                            </button>
                        </div>
                    </div>
            </div>
        {/each}
    </div>
</div>

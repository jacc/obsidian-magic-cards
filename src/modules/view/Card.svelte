<script lang="ts">
    import { Notice, type App, type TFile } from 'obsidian';
    import { generateFlashcards } from '../api';
    import type MagicCardsPlugin from 'src/main';

    export let app: App;
    export let settings: MagicCardsPlugin['settings']

    // State management
    let selectedProvider = 'https://api.deepseek.com';
    let selectedModel = 'deepseek-chat';
    let isGenerating = false;
    let generatedCards: Array<{front: string, back: string}> = [];
    let userContext = '';
    let abortController = new AbortController();

    // Provider configuration
    let providerOptions = [
        { value: "https://api.deepseek.com", label: "Deepseek" },
        { value: "https://api.openai.com", label: "OpenAI" }
    ];

    // Handle advanced mode
    $: {
        if (settings.advanced_mode && !providerOptions.some(p => p.value === "local")) {
            providerOptions = [
                ...providerOptions,
                { value: "local", label: "Local Model" }
            ];
        }
    }

    // API key management
    let apiKey = '';
    $: {
        switch (selectedProvider) {
            case 'https://api.deepseek.com':
                apiKey = settings.deepseek_key;
                break;
            case 'https://api.openai.com':
                apiKey = settings.openai_key;
                break;
            case 'local':
                apiKey = '';
                break;
            default:
                apiKey = '';
        }
    }

    async function handleGenerate() {
        isGenerating = true;
        generatedCards = [];
        abortController = new AbortController();

        try {
            const fileContent = await app.vault.read(app.workspace.getActiveFile()!);
            await generateFlashcards(
                {
                    apiBaseUrl: selectedProvider,
                    apiKey: apiKey,
                    model: selectedModel
                },
                fileContent, 
                userContext,
                (card) => { 
                    generatedCards = [...generatedCards, {
                        front: card.front,
                        back: card.back,
                    }];
                },
                abortController.signal
            );
            
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Error generating flashcards:', error);
                new Notice('Generation failed - check console for details');
            }
        } finally {
            isGenerating = false;
        }
    }

    function stopGeneration() {
        abortController.abort();
        isGenerating = false;
        new Notice('Generation stopped');
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
    <!-- Header Section -->
    <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
            <button disabled class="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center pointer-events-none">
                📄 <span class="ml-1">{app.workspace.getActiveFile()?.name || ""}</span>
            </button>
        </div>
        
        <div class="flex items-center gap-3">
            <select 
                bind:value={selectedProvider}
                class="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                disabled={isGenerating}
            >
                {#each providerOptions as provider}
                    <option value={provider.value}>{provider.label}</option>
                {/each}
            </select>
            
            {#if selectedProvider !== "local"}
                <select 
                    bind:value={selectedModel}
                    class="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    disabled={isGenerating}
                >
                    {#if selectedProvider === "https://api.deepseek.com"}
                        <option value="deepseek-chat">Deepseek Chat</option>
                    {/if}

                    {#if selectedProvider === "https://api.openai.com"}
                        <option value="gpt-4">GPT-4</option>
                        <option value="gpt-3.5">GPT-3.5</option>
                    {/if}
                </select>
            {/if}
        </div>
    </div>

    <!-- Input Section -->
    <div class="space-y-2 flex gap-2">
        <div class="mb-1 flex-1">
            <input
                type="text"
                placeholder="Specify context or instructions..."
                class="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                bind:value={userContext}
                disabled={isGenerating}
            />
        </div>
        <button 
            class="px-4 py-1.5 {isGenerating ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            on:click={isGenerating ? stopGeneration : handleGenerate}
            disabled={!isGenerating && (!apiKey || !userContext)}
        >
            {#if isGenerating}
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Stop Generating
            {:else}
                Generate
            {/if}
        </button>
    </div>

    <!-- Cards Display -->
    <div class="space-y-4">
        {#if generatedCards.length === 0 && !isGenerating}
            <div class="rounded-lg text-center text-gray-500 dark:text-gray-400">
                Click generate to create cards with 💫 magic 🪄
            </div>
        {/if}

        {#each generatedCards as card, i}
            <div class="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <div class="space-y-4">
                    <p class="text-bold text-gray-700 dark:text-gray-300">{card.front}</p>
                    <div class="border-t border-gray-200 dark:border-gray-700" />
                    <p class="text-gray-600 dark:text-gray-400">{card.back}</p>
                    <div class="flex gap-2">
                        <span class="text-sm text-gray-500 dark:text-gray-400 self-center mr-2">
                            {card.tokenCount ? `${card.tokenCount} tokens` : ''}
                        </span>
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
import { supabase } from './supabaseClient.js';

/**
 * Fetches all characters for the current user.
 * @returns {Promise<Array>} A promise that resolves to an array of characters.
 */
export async function getCharacters() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('characters')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching characters:', error);
        throw error;
    }

    return data;
}

/**
 * Creates a new character for the current user.
 * @param {object} characterData - The data for the new character.
 * @returns {Promise<object>} A promise that resolves to the created character object.
 */
export async function createCharacter(characterData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('You must be logged in to create a character.');

    const { data, error } = await supabase
        .from('characters')
        .insert([{ ...characterData, user_id: user.id }])
        .select()
        .single();

    if (error) {
        console.error('Error creating character:', error);
        throw error;
    }
    return data;
}

/**
 * Updates an existing character.
 * @param {string} id - The ID of the character to update.
 * @param {object} characterData - The new data for the character.
 * @returns {Promise<object>} A promise that resolves to the updated character object.
 */
export async function updateCharacter(id, characterData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('You must be logged in to update a character.');

    const { data, error } = await supabase
        .from('characters')
        .update(characterData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

    if (error) {
        console.error('Error updating character:', error);
        throw error;
    }
    return data;
}

/**
 * Deletes a character by its ID.
 * Media associated with this character will have their character_id set to NULL.
 * @param {string} id - The ID of the character to delete.
 * @returns {Promise<void>}
 */
export async function deleteCharacter(id) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('You must be logged in to delete a character.');

    const { error } = await supabase
        .from('characters')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) {
        console.error('Error deleting character:', error);
        throw error;
    }
}

/**
 * Fetches a single character by their ID.
 * @param {string} id - The ID of the character.
 * @returns {Promise<object>} A promise that resolves to the character object.
 */
export async function getCharacterById(id) {
    const { data, error } = await supabase
        .from('characters')
        .select('*')
        .eq('id', id)
        .single();
    
    if (error) {
        console.error('Error fetching character by ID:', error);
        throw error;
    }

    return data;
}

/**
 * Fetches all media items for the current user, with optional filtering and sorting.
 * @param {object} options - Filtering and sorting options.
 * @returns {Promise<Array>} A promise that resolves to an array of media items.
 */
export async function getMedia(options = {}) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    let query = supabase
        .from('media')
        .select('*')
        .eq('user_id', user.id);

    // Filtering
    if (options.filterByType) {
        query = query.eq('type', options.filterByType);
    }
    if (options.filterByCharacter) {
        query = query.eq('character_id', options.filterByCharacter);
    }
    if (options.filterByTag) {
        query = query.contains('tags', [options.filterByTag]);
    }

    // Sorting
    const sortBy = options.sortBy || 'created_at';
    const sortAsc = options.sortDirection === 'asc';
    query = query.order(sortBy, { ascending: sortAsc });

    const { data, error } = await query;
    
    if (error) {
        console.error('Error fetching media:', error);
        throw error;
    }

    return data;
}

/**
 * Searches media titles, tags, and associated character names.
 * @param {string} searchTerm - The term to search for.
 * @returns {Promise<Array>} A promise that resolves to an array of matching media items.
 */
export async function searchMedia(searchTerm) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !searchTerm) return [];

    // 1. Find characters matching the search term to get their IDs
    const { data: matchingCharacters, error: charError } = await supabase
        .from('characters')
        .select('id')
        .eq('user_id', user.id)
        .ilike('name', `%${searchTerm}%`);

    if (charError) {
        console.error('Error searching characters:', charError);
        throw charError;
    }
    const matchingCharacterIds = matchingCharacters.map(c => c.id);

    // 2. Build the .or() condition string
    const orConditions = [
        `name.ilike.%${searchTerm}%`,      // Search in media title
        `tags.cs.{${searchTerm}}`          // Search in tags array
    ];
    if (matchingCharacterIds.length > 0) {
        // Add condition to find media linked to the matched characters
        orConditions.push(`character_id.in.(${matchingCharacterIds.join(',')})`);
    }

    // 3. Execute the main query on the media table
    const { data, error } = await supabase
        .from('media')
        .select('*')
        .eq('user_id', user.id)
        .or(orConditions.join(','));
    
    if (error) {
        console.error('Error searching media:', error);
        throw error;
    }

    return data;
}

/**
 * Fetches a single media item by its ID.
 * @param {string} id - The ID of the media item.
 * @returns {Promise<object>} A promise that resolves to the media item object.
 */
export async function getMediaById(id) {
    const { data, error } = await supabase
        .from('media')
        .select('*, character:characters(*)')
        .eq('id', id)
        .single();
    
    if (error) {
        console.error('Error fetching media by ID:', error);
        throw error;
    }

    return data;
}

/**
 * Fetches all unique tags for the current user.
 * @returns {Promise<Array<string>>} A promise that resolves to an array of unique tags.
 */
export async function getUniqueTags() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('media')
        .select('tags')
        .eq('user_id', user.id);

    if (error) {
        console.error('Error fetching tags:', error);
        throw error;
    }

    const allTags = data.flatMap(item => item.tags || []);
    return [...new Set(allTags)].sort();
}


/**
 * Fetches all media items for a specific character.
 * @param {string} characterId - The ID of the character.
 * @returns {Promise<Array>} A promise that resolves to an array of media items.
 */
export async function getMediaByCharacterId(characterId) {
    const { data, error } = await supabase
        .from('media')
        .select('*')
        .eq('character_id', characterId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching media by character ID:', error);
        throw error;
    }

    return data;
}


/**
 * Creates a new media item for the current user.
 * @param {object} mediaData - The data for the new media item.
 * @returns {Promise<object>} A promise that resolves to the created media item.
 */
export async function createMedia(mediaData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('You must be logged in to create media.');

    const { data, error } = await supabase
        .from('media')
        .insert([{ ...mediaData, user_id: user.id }])
        .select()
        .single();

    if (error) {
        console.error('Error creating media:', error);
        throw error;
    }

    return data;
}

/**
 * Updates an existing media item.
 * @param {string} id - The ID of the media item to update.
 * @param {object} mediaData - The new data for the media item.
 * @returns {Promise<object>} A promise that resolves to the updated media item.
 */
export async function updateMedia(id, mediaData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('You must be logged in to update media.');

    const { data, error } = await supabase
        .from('media')
        .update(mediaData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

    if (error) {
        console.error('Error updating media:', error);
        throw error;
    }
    return data;
}

/**
 * Deletes a media item by its ID.
 * @param {string} id - The ID of the media item to delete.
 * @returns {Promise<void>}
 */
export async function deleteMedia(id) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('You must be logged in to delete media.');

    const { error } = await supabase
        .from('media')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // RLS handles this, but belt-and-suspenders.

    if (error) {
        console.error('Error deleting media:', error);
        throw error;
    }
}

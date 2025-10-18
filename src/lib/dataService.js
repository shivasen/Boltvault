import { supabase } from './supabaseClient.js';

const PAGE_SIZE = 20; // Number of items to fetch per page

// --- Profile Functions ---

/**
 * Fetches the public profile for the current user.
 * @returns {Promise<object>} A promise that resolves to the profile object.
 */
export async function getProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not logged in.');

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error fetching profile:', error);
        throw error;
    }

    return data;
}

/**
 * Updates the user's profile and auth metadata.
 * @param {object} profileData - The data to update.
 * @returns {Promise<void>}
 */
export async function updateProfile(profileData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('You must be logged in to update your profile.');

    const { username, full_name, avatar_url } = profileData;

    // 1. Update the public.profiles table
    const { error: profileError } = await supabase
        .from('profiles')
        .update({
            username,
            full_name,
            avatar_url,
            updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

    if (profileError) {
        console.error('Error updating profile:', profileError);
        throw profileError;
    }

    // 2. Update the user's auth metadata (e.g., for avatar display in Supabase UI)
    const { error: userError } = await supabase.auth.updateUser({
        data: {
            avatar_url: avatar_url,
            full_name: full_name,
        }
    });

    if (userError) {
        // This is less critical, so we'll log it but not throw an error
        console.warn('Could not update auth user metadata:', userError.message);
    }
}

/**
 * Deletes the current user's account by calling a stored procedure.
 * @returns {Promise<void>}
 */
export async function deleteUserAccount() {
    const { error } = await supabase.rpc('delete_user');
    if (error) {
        console.error('Error deleting user account:', error);
        throw error;
    }
}


// --- Character Functions ---

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

// --- Media Functions ---

/**
 * Fetches all media items for the current user, with optional filtering, sorting, and pagination.
 * @param {object} options - Filtering and sorting options.
 * @returns {Promise<{data: Array, hasMore: boolean}>} A promise that resolves to an object with media items and a flag indicating if more exist.
 */
export async function getMedia(options = {}) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [], hasMore: false };

    let query = supabase
        .from('media')
        .select('*', { count: 'exact' }) // Request count for pagination
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

    // Pagination
    const page = options.page || 0;
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    
    if (error) {
        console.error('Error fetching media:', error);
        throw error;
    }

    const hasMore = data ? (from + data.length) < count : false;

    return { data: data || [], hasMore };
}

/**
 * Searches media using the fuzzy search RPC function.
 * @param {string} searchTerm - The term to search for.
 * @returns {Promise<Array>} A promise that resolves to an array of matching media items.
 */
export async function searchMedia(searchTerm) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !searchTerm) return [];

    const { data, error } = await supabase.rpc('search_media_fuzzy', {
        search_term: searchTerm
    });

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
 * Creates a new media item for the current user. Handles file uploads.
 * @param {object} mediaData - The data for the new media item, may include a `file` object.
 * @returns {Promise<object>} A promise that resolves to the created media item.
 */
export async function createMedia(mediaData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('You must be logged in to create media.');

    const { file, ...restOfMediaData } = mediaData;

    if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('media')
            .upload(filePath, file);

        if (uploadError) {
            console.error('Error uploading file:', uploadError);
            throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
            .from('media')
            .getPublicUrl(filePath);

        restOfMediaData.url = publicUrlData.publicUrl;
        restOfMediaData.storage_path = filePath;
        restOfMediaData.type = file.type.startsWith('image') ? 'image' : 'video';
        restOfMediaData.is_embed = false;
    }

    const { data, error } = await supabase
        .from('media')
        .insert([{ ...restOfMediaData, user_id: user.id }])
        .select()
        .single();

    if (error) {
        console.error('Error creating media:', error);
        throw error;
    }

    return data;
}

/**
 * Updates an existing media item. Handles file uploads and cleanup.
 * @param {string} id - The ID of the media item to update.
 * @param {object} mediaData - The new data for the media item.
 * @returns {Promise<object>} A promise that resolves to the updated media item.
 */
export async function updateMedia(id, mediaData) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('You must be logged in to update media.');

    const { file, ...restOfMediaData } = mediaData;
    let oldStoragePath = null;

    // Fetch the existing media item to check for a storage_path
    const { data: existingMedia } = await supabase
        .from('media')
        .select('storage_path')
        .eq('id', id)
        .single();

    if (existingMedia && existingMedia.storage_path) {
        oldStoragePath = existingMedia.storage_path;
    }

    if (file) { // A new file is being uploaded
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const newFilePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage.from('media').upload(newFilePath, file);
        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(newFilePath);

        restOfMediaData.url = publicUrlData.publicUrl;
        restOfMediaData.storage_path = newFilePath;
        restOfMediaData.type = file.type.startsWith('image') ? 'image' : 'video';
        restOfMediaData.is_embed = false;
        restOfMediaData.thumbnail_url = null;

        // If there was an old file, remove it from storage
        if (oldStoragePath) {
            const { error: removeError } = await supabase.storage.from('media').remove([oldStoragePath]);
            if (removeError) console.warn('Could not remove old file from storage:', removeError);
        }
    } else if (restOfMediaData.source_type !== 'upload' && oldStoragePath) {
        // Switched from Upload to Link/Embed, so delete the old file
        const { error: removeError } = await supabase.storage.from('media').remove([oldStoragePath]);
        if (removeError) console.warn('Could not remove old file from storage:', removeError);
        
        restOfMediaData.storage_path = null;
    }
    
    delete restOfMediaData.source_type; // Don't save this to the DB

    const { data, error } = await supabase
        .from('media')
        .update(restOfMediaData)
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
 * Deletes a single media item by its ID.
 * The associated file in storage is deleted automatically by a database trigger.
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
        .eq('user_id', user.id);

    if (error) {
        console.error('Error deleting media:', error);
        throw error;
    }
}

/**
 * Deletes multiple media items using a batch RPC call.
 * The associated files in storage are deleted automatically by a database trigger.
 * @param {string[]} mediaIds - An array of media item IDs to delete.
 * @returns {Promise<void>}
 */
export async function deleteMultipleMedia(mediaIds) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('You must be logged in to delete media.');
    if (!mediaIds || mediaIds.length === 0) return;

    const { error } = await supabase.rpc('delete_media_batch', {
        media_ids: mediaIds
    });

    if (error) {
        console.error('Error batch deleting media:', error);
        throw error;
    }
}

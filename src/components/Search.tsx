'use client';

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';
import axios, { AxiosError } from "axios";

interface WordResult {
    word: string;
    definition: string;
    part_of_speech: string;
}

const Search = () => {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState<WordResult | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState('');

    const handleSearch = async () => {
        if (!query.trim()) return;

        try {
        setLoading(true);
        setError('');
        const response = await axios.get(`/api/entries?word=${query}`);

        // Update the result handling
        const { word, definition, part_of_speech } = response.data;
        if (word) {
            setResult({ word, definition, part_of_speech });
        } else {
            setResult(null);
            setError('Word not found');
        }
    } catch (err) {
        if (err instanceof AxiosError) {
            if (err.response?.status === 404) {
              setError('Word not found');
            } else {
              setError('An error occurred while searching');
            }
          } else {
            setError('An unexpected error occurred');
          }
          setResult(null);
    } finally {
        setLoading(false);
    }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Search for a Word</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex space-x-2">
                    <Input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Enter a word"
                        className="flex-grow"
                    />
                    <Button onClick={handleSearch} disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Search'}
                    </Button>
                </div>

                {result && !loading && (
                    <div className="mt-4">
                        <h3 className="text-lg font-semibold">{result.word}</h3>
                        <p className="text-sm text-muted-foreground">{result.part_of_speech}</p>
                        <p className="mt-2">{result.definition}</p>
                    </div>
                )}

                {error && !loading && (
                    <p className="mt-4 text-sm text-red-500">{error}</p>
                )}
            </CardContent>
        </Card>
    );
};

export default Search;
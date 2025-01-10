'use client';

import { useState } from 'react'
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"
import axios from 'axios';

const AddEntry = () => {
    const [word, setWord] = useState<string>('');
    const [definition, setDefinition] = useState<string>('');
    const [partOfSpeech, setPartOfSpeech] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const { toast } = useToast();

    const handleAddEntry = async () => {
        if (!word.trim() || !definition.trim() || !partOfSpeech.trim()) {
            toast({
                title: "Error",
                description: "Please fill in all fields",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        try {
            await axios.post('/api/entries', { word, definition, part_of_speech: partOfSpeech });
            toast({
                title: "Success",
                description: "Entry added successfully",
            });
            setWord('');
            setDefinition('');
            setPartOfSpeech('');
        } catch (error) {
            console.error('Error adding entry', error);
            toast({
                title: "Error",
                description: "An error occurred while adding the entry",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Add New Entry</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <Input
                        type="text"
                        value={word}
                        onChange={(e) => setWord(e.target.value)}
                        placeholder="Word"
                    />
                    <Input
                        type="text"
                        value={definition}
                        onChange={(e) => setDefinition(e.target.value)}
                        placeholder="Definition"
                    />
                    <Input
                        type="text"
                        value={partOfSpeech}
                        onChange={(e) => setPartOfSpeech(e.target.value)}
                        placeholder="Part of Speech"
                    />
                    <Button onClick={handleAddEntry} disabled={loading} className="w-full">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Add Entry'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

export default AddEntry;
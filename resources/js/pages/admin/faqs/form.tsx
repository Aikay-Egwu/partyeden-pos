import { Head, useForm } from '@inertiajs/react';
import { FormPage } from '@/components/admin/form-page';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Faq = {
    id: string;
    question: string;
    answer: string;
    category: 'winter' | 'summer' | 'general';
    sort_order: number;
    is_visible: boolean;
} | null;

export default function FaqForm({ faq }: { faq: Faq }) {
    const isEditing = faq !== null;
    const { data, setData, post, put, processing, errors } = useForm({
        question: faq?.question ?? '',
        answer: faq?.answer ?? '',
        category: faq?.category ?? 'general',
        sort_order: faq?.sort_order ?? 0,
        is_visible: faq?.is_visible ?? true,
    });

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (isEditing) {
            put(`/admin/faqs/${faq.id}`);
        } else {
            post('/admin/faqs');
        }
    };

    return (
        <>
            <Head title={isEditing ? 'Edit FAQ' : 'Add FAQ'} />
            <FormPage
                title={isEditing ? 'Edit FAQ' : 'Add FAQ'}
                backUrl="/admin/faqs"
            >
                <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="question">Question</Label>
                        <Input
                            id="question"
                            value={data.question}
                            onChange={(event) =>
                                setData('question', event.target.value)
                            }
                            required
                        />
                        <InputError message={errors.question} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="answer">Answer</Label>
                        <textarea
                            id="answer"
                            value={data.answer}
                            onChange={(event) =>
                                setData('answer', event.target.value)
                            }
                            required
                            className="min-h-48 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
                        />
                        <InputError message={errors.answer} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="category">Season</Label>
                            <select
                                id="category"
                                value={data.category}
                                onChange={(event) =>
                                    setData(
                                        'category',
                                        event.target
                                            .value as typeof data.category,
                                    )
                                }
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs"
                            >
                                <option value="general">General care</option>
                                <option value="winter">Winter care</option>
                                <option value="summer">Summer care</option>
                            </select>
                            <InputError message={errors.category} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sort_order">Display order</Label>
                            <Input
                                id="sort_order"
                                type="number"
                                min="0"
                                value={data.sort_order}
                                onChange={(event) =>
                                    setData(
                                        'sort_order',
                                        Number(event.target.value),
                                    )
                                }
                                required
                            />
                            <InputError message={errors.sort_order} />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            id="is_visible"
                            type="checkbox"
                            checked={data.is_visible}
                            onChange={(event) =>
                                setData('is_visible', event.target.checked)
                            }
                            className="size-4 rounded border-input accent-primary"
                        />
                        <Label htmlFor="is_visible">
                            Show on the public FAQ page
                        </Label>
                    </div>
                    <InputError message={errors.is_visible} />

                    <Button type="submit" disabled={processing}>
                        {isEditing ? 'Save changes' : 'Create FAQ'}
                    </Button>
                </form>
            </FormPage>
        </>
    );
}

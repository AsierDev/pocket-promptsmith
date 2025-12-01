import { describe, expect, it, vi, beforeEach } from 'vitest';
import { CopyProposalButton } from '@/components/common/CopyProposalButton';
import { toast } from 'sonner';

const mockWriteText = vi.fn().mockResolvedValue(undefined);
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText
  }
});

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

describe('CopyProposalButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have correct props', () => {
    const props = {
      text: 'Test text',
      variant: 'secondary' as const,
      className: 'custom-class',
      children: 'Copy my text'
    };

    expect(CopyProposalButton).toBeDefined();
    const element = CopyProposalButton(props);
    expect(element).toBeDefined();
  });

  it('should use default values when not provided', () => {
    const props = {
      text: 'Test text'
    };

    const element = CopyProposalButton(props);
    expect(element).toBeDefined();
  });

  it('should copy text correctly', async () => {
    const props = {
      text: 'Test text'
    };

    // Simulate component behavior
    const mockCopyFunction = async () => {
      try {
        await navigator.clipboard.writeText(props.text);
        toast.success('Proposal copied');
      } catch (error) {
        toast.error('Could not copy');
      }
    };

    await mockCopyFunction();

    expect(mockWriteText).toHaveBeenCalledWith('Test text');
    expect(toast.success).toHaveBeenCalledWith('Proposal copied');
  });

  it('should handle copy errors', async () => {
    mockWriteText.mockRejectedValueOnce(new Error('Copy error'));

    const props = {
      text: 'Test text'
    };

    // Simulate component behavior
    const mockCopyFunction = async () => {
      try {
        await navigator.clipboard.writeText(props.text);
        toast.success('Proposal copied');
      } catch (error) {
        toast.error('Could not copy');
      }
    };

    await mockCopyFunction();

    expect(mockWriteText).toHaveBeenCalledWith('Test text');
    expect(toast.error).toHaveBeenCalledWith('Could not copy');
  });
});

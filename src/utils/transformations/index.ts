import { DFAtoNFA } from './DFAtoNFA';
import { NFAtoDFA } from './NFAtoDFA';
import { DFAtoPDA } from './DFAtoPDA';
import { PDAtoDFA } from './PDAtoDFA';
import { PDAtoNFA } from './PDAtoNFA';
import { NFAtoPDA } from './NFAtoPDA';

export const transformations = {
    DFAtoNFA: DFAtoNFA,
    DFAtoPDA: DFAtoPDA,
    NFAtoDFA: NFAtoDFA,
    NFAtoPDA: NFAtoPDA,
    PDAtoDFA: PDAtoDFA,
    PDAtoNFA: PDAtoNFA,
};

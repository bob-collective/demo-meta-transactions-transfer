import { Card, Flex, H1, Input, TokenInput } from '@interlay/ui';
import { Layout } from './components';

import { useForm } from '@interlay/hooks';
import { mergeProps } from '@react-aria/utils';
import { useMutation } from '@tanstack/react-query';
import { Key, useEffect, useState } from 'react';
import { StyledWrapper } from './App.style';
import { AuthCTA } from './components/AuthCTA';
import { ContractType, CurrencyTicker, Erc20CurrencyTicker } from './constants';
import { useBalances } from './hooks/useBalances';
import { isFormDisabled } from './utils/validation';
import './utils/yup.custom';
import { useContract } from './hooks/useContract';
import { toAtomicAmount } from './utils/currencies';
import { useErc20Allowance } from './hooks/useErc20Allowance';

type TransferForm = {
  amount: string;
  ticker: string;
  address: string;
};

function App() {
  const { relayedContract } = useContract(ContractType.WBTC);
  const [ticker, setTicker] = useState<CurrencyTicker>(Erc20CurrencyTicker.WBTC);
  const {
    wrapInErc20ApprovalTx,
    isAllowed,
    isLoading: isLoadingApproval
  } = useErc20Allowance(ContractType.ERC20_PAYMASTER, Erc20CurrencyTicker.WBTC);
  const { balances, getBalance } = useBalances();
  const [waitingOnRelay, setWaitingOnRelay] = useState(false);

  const mutation = useMutation({
    mutationFn: async (form: TransferForm) => {
      if (!relayedContract) {
        return;
      }

      const relayTx = async () => {
        setWaitingOnRelay(true);
        const atomicAmount = toAtomicAmount(form.amount, 'WBTC');
        const transferTx = await relayedContract.transfer(form.address, atomicAmount.toString());

        await transferTx.wait();
        console.log(`Transaction succesfully relayed with id: ${transferTx.hash}`);
        setWaitingOnRelay(false);
      };

      wrapInErc20ApprovalTx(relayTx);
      return;
    }
  });

  const handleSubmit = (values: TransferForm) => {
    mutation.mutate(values);
  };

  const balance = getBalance(ticker);

  const form = useForm<TransferForm>({
    initialValues: {
      amount: '',
      ticker: 'WBTC',
      address: ''
    },
    onSubmit: handleSubmit,
    hideErrors: 'untouched'
  });

  useEffect(() => {
    if (!balances) return;

    form.validateForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balances]);

  const isSubmitDisabled = isFormDisabled(form) || waitingOnRelay || isLoadingApproval;

  return (
    <Layout>
      <StyledWrapper direction='column' gap='spacing4'>
        <Card>
          <H1 align='center' size='xl'>
            Transfer
          </H1>
          <form onSubmit={form.handleSubmit}>
            <Flex marginTop='spacing4' direction='column' gap='spacing8'>
              <Flex direction='column' gap='spacing4'>
                <TokenInput
                  type='selectable'
                  label='Amount'
                  balance={balance?.toBig().toString()}
                  valueUSD={0}
                  selectProps={mergeProps(
                    {
                      items: [
                        {
                          value: 'WBTC',
                          balance: getBalance(Erc20CurrencyTicker.WBTC).toBig().toNumber(),
                          balanceUSD: 0
                        }
                      ],
                      onSelectionChange: (key: Key) => setTicker(key as Erc20CurrencyTicker)
                    },
                    form.getSelectFieldProps('ticker')
                  )}
                  {...form.getTokenFieldProps('amount')}
                />
                <Input label='Address' placeholder='Enter address' {...form.getFieldProps('address')} />
              </Flex>
              <AuthCTA loading={mutation.isLoading} disabled={isSubmitDisabled} size='large' type='submit' fullWidth>
                {isAllowed ? 'Transfer' : 'Approve & Transfer'}
              </AuthCTA>
            </Flex>
          </form>
        </Card>
      </StyledWrapper>
    </Layout>
  );
}

export default App;

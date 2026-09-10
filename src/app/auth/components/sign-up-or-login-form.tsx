'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

import { cn } from '@/lib/utils';
import { safeNextPath } from '@/lib/safe-next-path';
import { Button } from '@/components/ui/button';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Form, ActionFormExtension } from '@/components/ui/form';
import { signInAction, signUpAction } from '@/app/auth/actions';
import { z } from 'zod';
import icon from '@/app/icon.svg';
import bg from '@/assets/login-form-bg.png';
import bg2 from '@/assets/login-form-bg-2.png';
import Image from 'next/image';

const loginSchema = z.object({
  email: z.string().email('Invalid email format').trim(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signUpSchema = z.object({
  email: z.string().email('Invalid email format').trim(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

interface AuthFormProps extends React.ComponentPropsWithoutRef<'div'> {
  onSwitch?: () => void;
}

export function LoginForm({ className, ...props }: AuthFormProps) {
  const router = useRouter();
  return (
    <Card className={cn('rounded-tr-none rounded-br-none border-r-0', className)} {...props}>
      <CardHeader className='inline-flex flex-col items-center'>
        <div className='rounded-full bg-muted p-2'><Image alt="" src={icon.src} className='h-6 w-6' /></div>
        <CardTitle className='text-2xl'>Mag Sign in</CardTitle>
        <CardDescription className='text-center'>Sign in</CardDescription>
      </CardHeader>
      <CardContent>
        <Form schema={loginSchema} className='relative overflow-hidden bg-cover bg-center'>
          <ActionFormExtension action={signInAction} onSuccess={() => {
            const next = new URLSearchParams(window.location.search).get('next');
            router.push(safeNextPath(next, '/protected'));
          }} />
          <div className='flex flex-col gap-6 bg-card text-foreground'>
            <div className='grid gap-2'><Label htmlFor='email'>Email</Label><Input id='email' name='email' type='email' placeholder='m@example.com' required /></div>
            <div className='grid gap-2'><div className='flex items-center'><Label htmlFor='password'>Password</Label><Link href='/auth/forgot-password' className='ml-auto text-sm underline'>Forgot?</Link></div><Input id='password' name='password' type='password' required /></div>
            <Button type='submit' className='w-full'>Sign in</Button>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}

export function SignUpForm({ className, onSwitch, ...props }: AuthFormProps) {
  const router = useRouter();
  return (
    <Card className={cn('rounded-tl-none rounded-bl-none border-l-0', className)} {...props}>
      <CardHeader><CardTitle className='text-2xl'>Mag Sign up</CardTitle><CardDescription>Create account</CardDescription></CardHeader>
      <CardContent>
        <Form schema={signUpSchema}>
          <ActionFormExtension action={signUpAction} onSuccess={() => router.push('/auth/sign-up-success')} />
          <div className='flex flex-col gap-6 bg-card text-foreground'>
            <div className='grid gap-2'><Label htmlFor='email'>Email</Label><Input id='email' name='email' type='email' placeholder='m@example.com' required /></div>
            <div className='grid gap-2'><Label htmlFor='password'>Password</Label><Input id='password' name='password' type='password' required /></div>
            <Button type='submit' className='w-full'>Sign up</Button>
          </div>
        </Form>
        <div className='mt-4 text-center text-sm'>Have account? <button type='button' onClick={onSwitch} className='underline'>Sign in</button></div>
      </CardContent>
    </Card>
  );
}

type AuthMode = 'login' | 'sign-up';
interface Props extends React.ComponentPropsWithoutRef<'div'> { defaultMode?: AuthMode; }
export function SignUpOrLoginForm({ className, defaultMode = 'login', ...props }: Props) {
  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const isLogin = mode === 'login';
  const FormComp = isLogin ? LoginForm : SignUpForm;
  return (
    <div className={cn('flex flex-col md:flex-row md:items-stretch', className)} {...props}>
      <AnimatePresence mode='wait'>
        <motion.div key={mode} layoutId='auth-form' initial={{opacity:0,x:-15}} animate={{opacity:1,x:0}} exit={{opacity:0,x:15}} transition={{opacity:{duration:0.2},x:{type:'spring',stiffness:300,damping:30}}} className='w-full md:flex-1'>
          <FormComp onSwitch={() => setMode(isLogin ? 'sign-up' : 'login')} className='h-full' />
        </motion.div>
      </AnimatePresence>
      <AnimatePresence mode='wait'>
        <motion.div key='artwork' layoutId='auth-artwork' initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.3}} className='hidden h-full min-h-125 rounded-xl border md:block' style={{backgroundImage:`url(${isLogin ? bg.src : bg2.src})`,backgroundSize:'cover',backgroundPosition:'center'}} />
      </AnimatePresence>
    </div>
  );
}

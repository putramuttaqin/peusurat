import { useState, useContext, useMemo } from 'preact/hooks';
import { AuthContext } from '../../shared/AuthContext';
import kodeSurat from '../../data/kode-surat.json';
import { SIFAT_SURAT, JENIS_SURAT_OPTIONS } from '../../shared/enum';
import { submitSurat } from '../../api/surat';
import FormSurat from './FormSurat';

export default function FormSection({ compact = false, onSuccess }) {
  const { user, isAdmin, loading } = useContext(AuthContext);

  if (loading || !isAdmin) return null;

  const [formState, setFormState] = useState({
    jenisSurat: JENIS_SURAT_OPTIONS[0],
    wilayah: 'W.1',
    kode1: '',
    kode2: '',
    kode3: '',
    tanggalSurat: '',
    sifatSurat: SIFAT_SURAT.BIASA,
    keterangan: ''
  });

  const [submitting, setSubmitting] = useState(false);

  const kode1Options = useMemo(
    () =>
      Object.entries(kodeSurat).map(([id, val]) => ({
        id,
        name: val.name,
        shortName: val.name.split(' - ')[0].substring(0, 2)
      })),
    []
  );

  const kode2Options = useMemo(() => {
    if (!formState.kode1) return [];
    return Object.entries(kodeSurat[formState.kode1].children || {}).map(
      ([id, val]) => ({
        id,
        name: val.name,
        shortName: val.name.split(' - ')[0].substring(0, 2)
      })
    );
  }, [formState.kode1]);

  const kode3Options = useMemo(() => {
    if (!formState.kode1 || !formState.kode2) return [];
    return Object.entries(
      kodeSurat[formState.kode1].children[formState.kode2].children || {}
    ).map(([id, val]) => ({
      id,
      name: val.name,
      shortName: val.name.split(' - ')[0].substring(0, 2)
    }));
  }, [formState.kode1, formState.kode2]);

  const getShort = (options, id) =>
    options.find(o => o.id === id)?.shortName || '';

  const nomorPreview = `W.1-${getShort(
    kode1Options,
    formState.kode1
  )}.${getShort(kode2Options, formState.kode2)}.${getShort(
    kode3Options,
    formState.kode3
  )}-...`;

  const isValid =
    formState.jenisSurat &&
    formState.kode1 &&
    formState.kode2 &&
    formState.kode3;

  const handleChange = field => e => {
    const value =
      field === 'sifatSurat'
        ? parseInt(e.target.value)
        : e.target.value;

    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const handleKodeChange = field => e => {
    const value = e.target.value;
    setFormState(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'kode1' && { kode2: '', kode3: '' }),
      ...(field === 'kode2' && { kode3: '' })
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!isValid || submitting) return;

    setSubmitting(true);

    const nomorSurat = `W.1-${getShort(
      kode1Options,
      formState.kode1
    )}.${getShort(kode2Options, formState.kode2)}.${getShort(
      kode3Options,
      formState.kode3
    )}-xyz`;

    try {
      await submitSurat({
        userId: user.id,
        jenisSurat: formState.jenisSurat,
        sifatSurat: formState.sifatSurat,
        perihalSurat: formState.keterangan,
        tanggalSurat: formState.tanggalSurat,
        nomorSurat
      });

      onSuccess?.();

      setFormState(prev => ({
        ...prev,
        kode1: '',
        kode2: '',
        kode3: '',
        keterangan: ''
      }));
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormSurat
      compact={compact}
      formState={formState}
      jenisSuratOptions={JENIS_SURAT_OPTIONS}
      kode1Options={kode1Options}
      kode2Options={kode2Options}
      kode3Options={kode3Options}
      nomorPreview={nomorPreview}
      submitting={submitting}
      isValid={isValid}
      onChange={handleChange}
      onKodeChange={handleKodeChange}
      onSubmit={handleSubmit}
    />
  );
}
